import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import Project from '@/models/Project';
import Team from '@/models/Team';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { title, description, projectId, assignedTo, priority, status } =
      await req.json();

    // Verify project ownership (via team)
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    const team = await Team.findOne({
      _id: project.teamId,
      owner: user.userId,
    });
    if (!team) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo: assignedTo || null,
      priority,
      status,
    });

    // Populate the task before returning
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name')
      .populate('projectId', 'name')
      .lean();

    if (!populatedTask) {
      return NextResponse.json(
        { error: 'Task not found after creation' },
        { status: 500 }
      );
    }

    // Ensure _id is converted to string
    const transformedTask = {
      ...populatedTask,
      _id: populatedTask._id.toString(),
      projectId: populatedTask.projectId
        ? {
            _id:
              populatedTask.projectId._id?.toString() ||
              populatedTask.projectId._id,
            name: populatedTask.projectId.name,
          }
        : populatedTask.projectId,
      assignedTo: populatedTask.assignedTo
        ? {
            _id:
              populatedTask.assignedTo._id?.toString() ||
              populatedTask.assignedTo._id,
            name: populatedTask.assignedTo.name,
          }
        : populatedTask.assignedTo,
    };

    console.log('Created task:', transformedTask);
    console.log('Created task _id type:', typeof transformedTask._id);

    return NextResponse.json(transformedTask, { status: 201 });
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const memberId = searchParams.get('memberId');

    await dbConnect();

    interface TaskQuery {
      projectId?: string | { $in: unknown[] };
      assignedTo?: string;
    }

    const query: TaskQuery = {};

    if (projectId) {
      query.projectId = projectId;
    }
    if (memberId) {
      query.assignedTo = memberId;
    }

    // Security check: Ensure the user owns the teams related to these tasks
    // This is a bit complex for a simple query, so we might simplify by fetching all user's teams first
    const teams = await Team.find({ owner: user.userId }).select('_id');
    const teamIds = teams.map((t) => t._id);
    const projects = await Project.find({ teamId: { $in: teamIds } }).select(
      '_id'
    );
    const projectIds = projects.map((p) => p._id);

    // If projectId is provided, verify it belongs to user
    if (projectId && !projectIds.find((id) => id.toString() === projectId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If no specific project filter, constrain to all user's projects
    if (!projectId) {
      query.projectId = { $in: projectIds };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name')
      .populate('projectId', 'name')
      .lean();

    // Ensure _id is converted to string
    const transformedTasks = tasks.map((task) => ({
      ...task,
      _id: task._id.toString(),
      projectId: task.projectId
        ? {
            _id: task.projectId._id?.toString() || task.projectId._id,
            name: task.projectId.name,
          }
        : task.projectId,
      assignedTo: task.assignedTo
        ? {
            _id: task.assignedTo._id?.toString() || task.assignedTo._id,
            name: task.assignedTo.name,
          }
        : task.assignedTo,
    }));

    console.log('Fetched tasks count:', transformedTasks.length);
    if (transformedTasks.length > 0) {
      console.log('Sample task:', transformedTasks[0]);
      console.log('Sample task _id type:', typeof transformedTasks[0]._id);
    }

    return NextResponse.json(transformedTasks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

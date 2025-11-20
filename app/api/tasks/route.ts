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

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
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

    let query: any = {};

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
      .populate('projectId', 'name');

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id, ...updateData } = await req.json();

    // Verify ownership
    const task = await Task.findById(id).populate('projectId');
    if (!task)
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    // Check if project belongs to a team owned by user
    // We need to fetch the project to get teamId
    const project = await Project.findById(task.projectId);
    const team = await Team.findOne({
      _id: project.teamId,
      owner: user.userId,
    });

    if (!team) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    await dbConnect();

    const task = await Task.findById(id);
    if (!task)
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const project = await Project.findById(task.projectId);
    const team = await Team.findOne({
      _id: project.teamId,
      owner: user.userId,
    });

    if (!team) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await Task.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

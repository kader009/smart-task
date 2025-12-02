import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import Project from '@/models/Project';
import Team from '@/models/Team';
import ActivityLog from '@/models/ActivityLog';
import { getUserFromToken } from '@/lib/auth';
import mongoose from 'mongoose';

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const updateData = await req.json();

    // Handle both Promise and direct params (Next.js 15+ vs older versions)
    const params = await Promise.resolve(context.params);
    let id = params?.id;

    if (!id) {
      console.log('No ID in params!', params);
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Trim and clean the ID
    id = id.trim();

    console.log('=== UPDATE TASK DEBUG ===');
    console.log('Params:', params);
    console.log('Cleaned ID:', id);
    console.log('ID length:', id.length);
    console.log('Update data:', updateData);

    // Validate ObjectId
    const isValid = mongoose.Types.ObjectId.isValid(id);
    console.log('Is valid ObjectId?', isValid);

    if (!isValid) {
      console.log('INVALID ObjectId format:', id);
      return NextResponse.json(
        { error: 'Invalid task ID format' },
        { status: 400 }
      );
    }

    // Handle empty assignedTo
    if (updateData.assignedTo === '' || updateData.assignedTo === undefined) {
      updateData.assignedTo = null;
    }

    // Verify ownership
    const task = await Task.findById(id);
    if (!task) {
      console.log('Task not found in database:', id);
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    console.log('Task found:', task);

    // Check if project belongs to a team owned by user
    const project = await Project.findById(task.projectId);
    if (!project) {
      console.log('Project not found:', task.projectId);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    console.log('Project found:', project);

    const team = await Team.findOne({
      _id: project.teamId,
      owner: user.userId,
    });

    if (!team) {
      console.log('Unauthorized: Team not found or not owned by user');
      console.log('Team ID:', project.teamId, 'User ID:', user.userId);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('Team verified, updating task...');

    interface PopulatedTask {
      _id: { toString: () => string };
      title: string;
      description: string;
      priority: string;
      status: string;
      projectId?:
        | {
            _id: { toString?: () => string } | string;
            name: string;
          }
        | string;
      assignedTo?: {
        _id: { toString?: () => string } | string;
        name: string;
      } | null;
    }

    const updatedTask = (await Task.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate('assignedTo', 'name')
      .populate('projectId', 'name')
      .lean()) as PopulatedTask | null;

    if (!updatedTask) {
      return NextResponse.json(
        { error: 'Task not found after update' },
        { status: 404 }
      );
    }

    // Create activity log
    const details: string[] = [];
    if (updateData.title) details.push(`title to "${updateData.title}"`);
    if (updateData.status) details.push(`status to ${updateData.status}`);
    if (updateData.priority) details.push(`priority to ${updateData.priority}`);
    if (updateData.assignedTo !== undefined) {
      if (updateData.assignedTo === null) {
        details.push('removed assignment');
      } else if (
        typeof updatedTask.assignedTo === 'object' &&
        updatedTask.assignedTo?.name
      ) {
        details.push(`assigned to ${updatedTask.assignedTo.name}`);
      }
    }

    await ActivityLog.create({
      action: 'task_updated',
      details: `Updated task: ${updatedTask.title}${
        details.length > 0 ? ` (${details.join(', ')})` : ''
      }`,
      teamId: project.teamId,
      userId: user.userId,
    });

    // Ensure _id is converted to string
    const transformedTask = {
      ...updatedTask,
      _id: updatedTask._id.toString(),
      projectId:
        updatedTask.projectId && typeof updatedTask.projectId === 'object'
          ? {
              _id:
                typeof updatedTask.projectId._id === 'object' &&
                updatedTask.projectId._id.toString
                  ? updatedTask.projectId._id.toString()
                  : updatedTask.projectId._id,
              name: updatedTask.projectId.name,
            }
          : updatedTask.projectId,
      assignedTo:
        updatedTask.assignedTo && typeof updatedTask.assignedTo === 'object'
          ? {
              _id:
                typeof updatedTask.assignedTo._id === 'object' &&
                updatedTask.assignedTo._id.toString
                  ? updatedTask.assignedTo._id.toString()
                  : updatedTask.assignedTo._id,
              name: updatedTask.assignedTo.name,
            }
          : updatedTask.assignedTo,
    };

    console.log('Task updated successfully:', transformedTask);
    return NextResponse.json(transformedTask);
  } catch (error) {
    console.error('Task update error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Handle both Promise and direct params
    const params = await Promise.resolve(context.params);
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const task = await Task.findById(id);
    if (!task)
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const project = await Project.findById(task.projectId);
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

    // Create activity log before deletion
    await ActivityLog.create({
      action: 'task_deleted',
      details: `Deleted task: ${task.title}`,
      teamId: project.teamId,
      userId: user.userId,
    });

    await Task.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Task delete error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

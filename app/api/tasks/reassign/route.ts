import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import Member from '@/models/Member';
import Project from '@/models/Project';
import ActivityLog from '@/models/ActivityLog';
import Team from '@/models/Team';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { teamId } = await req.json();

    // Verify team ownership
    const team = await Team.findOne({ _id: teamId, owner: user.userId });
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found or unauthorized' },
        { status: 403 }
      );
    }

    // 1. Get all members
    const members = await Member.find({ teamId });

    // 2. Get all projects for this team
    const projects = await Project.find({ teamId }).select('_id');
    const projectIds = projects.map((p) => p._id);

    // 3. Get all active tasks (Pending/In Progress) for these projects
    const tasks = await Task.find({
      projectId: { $in: projectIds },
      status: { $ne: 'Done' },
    });

    // 4. Calculate Load
    const memberLoad: Record<string, number> = {};
    members.forEach((m) => (memberLoad[m._id.toString()] = 0));

    tasks.forEach((t) => {
      if (t.assignedTo) {
        const mId = t.assignedTo.toString();
        if (memberLoad[mId] !== undefined) {
          memberLoad[mId]++;
        }
      }
    });

    const overloadedMembers = members.filter(
      (m) => memberLoad[m._id.toString()] > m.capacity
    );
    const underloadedMembers = members.filter(
      (m) => memberLoad[m._id.toString()] < m.capacity
    );

    // Sort underloaded members by available capacity (descending)
    underloadedMembers.sort((a, b) => {
      const capA = a.capacity - memberLoad[a._id.toString()];
      const capB = b.capacity - memberLoad[b._id.toString()];
      return capB - capA;
    });

    const logs = [];
    let reassignmentsCount = 0;

    // 5. Reassign Logic
    for (const overloadedMember of overloadedMembers) {
      let currentLoad = memberLoad[overloadedMember._id.toString()];

      // Get reassignable tasks (Low/Medium)
      const memberTasks = tasks.filter(
        (t) =>
          t.assignedTo?.toString() === overloadedMember._id.toString() &&
          ['Low', 'Medium'].includes(t.priority)
      );

      for (const task of memberTasks) {
        if (currentLoad <= overloadedMember.capacity) break; // Stop if load is balanced

        // Find a target member
        const targetMember = underloadedMembers.find(
          (m) => memberLoad[m._id.toString()] < m.capacity
        );

        if (targetMember) {
          // Reassign
          task.assignedTo = targetMember._id;
          await task.save();

          // Update loads
          memberLoad[overloadedMember._id.toString()]--;
          memberLoad[targetMember._id.toString()]++;
          currentLoad--;

          // Log
          const logMessage = `Task "${task.title}" reassigned from ${overloadedMember.name} to ${targetMember.name}`;
          logs.push({
            message: logMessage,
            teamId: teamId,
          });
          reassignmentsCount++;

          // Re-sort underloaded members if needed (simple approach: just continue, next loop will check capacity)
        }
      }
    }

    if (logs.length > 0) {
      await ActivityLog.insertMany(logs);
    }

    return NextResponse.json({
      message: `Reassigned ${reassignmentsCount} tasks`,
      logs,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

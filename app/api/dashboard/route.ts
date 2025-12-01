import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import Project from '@/models/Project';
import Team from '@/models/Team';
import Member from '@/models/Member';
import ActivityLog from '@/models/ActivityLog';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');

    await dbConnect();

    let teamIds: unknown[] = [];
    if (teamId) {
      const team = await Team.findOne({ _id: teamId, owner: user.userId });
      if (!team)
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      teamIds = [team._id];
    } else {
      const teams = await Team.find({ owner: user.userId }).select('_id');
      teamIds = teams.map((t) => t._id);
    }

    // Projects
    const projects = await Project.find({ teamId: { $in: teamIds } });
    const projectIds = projects.map((p) => p._id);

    // Tasks
    const tasks = await Task.find({ projectId: { $in: projectIds } });

    // Logs
    const logs = await ActivityLog.find({ teamId: { $in: teamIds } })
      .sort({ createdAt: -1 })
      .limit(10);

    // Members with Load (only if teamId is specific, or we can aggregate all)
    // Let's return all members for the selected teams
    const members = await Member.find({ teamId: { $in: teamIds } });

    // Calculate load for each member
    const memberStats = members.map((member) => {
      const memberTasks = tasks.filter(
        (t) =>
          t.assignedTo &&
          t.assignedTo.toString() === member._id.toString() &&
          t.status !== 'Done'
      );
      return {
        ...member.toObject(),
        currentLoad: memberTasks.length,
      };
    });

    const completedTasks = tasks.filter((t) => t.status === 'Done').length;
    const openTasks = tasks.length - completedTasks;

    return NextResponse.json({
      totalProjects: projects.length,
      totalTasks: tasks.length,
      completedTasks,
      openTasks,
      recentLogs: logs,
      memberStats,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Team from '@/models/Team';
import ActivityLog from '@/models/ActivityLog';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { name, description, teamId } = await req.json();

    // Verify team ownership
    const team = await Team.findOne({ _id: teamId, owner: user.userId });
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found or unauthorized' },
        { status: 404 }
      );
    }

    const project = await Project.create({
      name,
      description,
      teamId,
    });

    // Create activity log
    await ActivityLog.create({
      action: 'project_created',
      details: `Created project: ${name}`,
      teamId,
      userId: user.userId,
    });

    return NextResponse.json(project, { status: 201 });
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
    const teamId = searchParams.get('teamId');

    await dbConnect();

    interface ProjectQuery {
      teamId?: string | { $in: unknown[] };
    }

    const query: ProjectQuery = {};
    if (teamId) {
      // Verify team ownership if filtering by team
      const team = await Team.findOne({ _id: teamId, owner: user.userId });
      if (!team) {
        return NextResponse.json(
          { error: 'Team not found or unauthorized' },
          { status: 404 }
        );
      }
      query.teamId = teamId;
    } else {
      // If no teamId provided, find all projects for teams owned by user
      const teams = await Team.find({ owner: user.userId }).select('_id');
      const teamIds = teams.map((t) => t._id);
      query.teamId = { $in: teamIds };
    }

    const projects = await Project.find(query).populate('teamId', 'name');
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

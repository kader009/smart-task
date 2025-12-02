import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Member from '@/models/Member';
import Team from '@/models/Team';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all teams owned by the user
    const teams = await Team.find({ owner: user.userId }).select('_id');
    const teamIds = teams.map((t) => t._id);

    // Get all members from all teams
    const members = await Member.find({ teamId: { $in: teamIds } });

    return NextResponse.json(members);
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

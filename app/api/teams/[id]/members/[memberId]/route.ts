import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Member from '@/models/Member';
import Team from '@/models/Team';
import { getUserFromToken } from '@/lib/auth';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id, memberId } = await params;

    // Verify team ownership
    const team = await Team.findOne({ _id: id, owner: user.userId });
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the member
    const deletedMember = await Member.findOneAndDelete({
      _id: memberId,
      teamId: id,
    });

    if (!deletedMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

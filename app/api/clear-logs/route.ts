import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';
import { getUserFromToken } from '@/lib/auth';

export async function DELETE(req: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Delete all activity logs
    const result = await ActivityLog.deleteMany({});

    return NextResponse.json({
      message: 'All activity logs cleared',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Clear logs error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

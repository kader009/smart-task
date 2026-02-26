import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getUserFromToken } from '@/lib/auth';

interface UpdateProfile {
  name?: string;
  password?: string;
  avatarUrl?: string;
}

interface LeanUser {
  _id: unknown;
  name: string;
  email: string;
  avatarUrl?: string;
}

export async function PATCH(req: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = (await req.json()) as UpdateProfile;
    const { name, password, avatarUrl } = body;

    const updates: Partial<UpdateProfile> = {};

    if (name && typeof name === 'string' && name.trim().length > 0) {
      updates.name = name.trim();
    }

    if (avatarUrl !== undefined) {
      updates.avatarUrl = typeof avatarUrl === 'string' ? avatarUrl.trim() : '';
    }

    if (password !== undefined) {
      if (typeof password !== 'string' || password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 },
        );
      }

      const hashed = await bcrypt.hash(password, 10);
      updates.password = hashed;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 },
      );
    }

    const updated = await User.findByIdAndUpdate(user.userId, updates, {
      new: true,
    })
      .select('-password')
      .lean<LeanUser>();

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: updated._id,
      name: updated.name,
      email: updated.email,
      avatarUrl: updated.avatarUrl ?? '',
    });
  } catch (error: unknown) {
    console.error('Profile update error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: message },
      { status: 500 },
    );
  }
}

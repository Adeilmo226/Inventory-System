import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getAuthUser();
    
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { userId } = await params;

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // Get user to update
    const targetUser = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Toggle admin status
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { isAdmin: !targetUser.isAdmin } },
      { returnDocument: 'after', projection: { passwordHash: 0 } }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { 
        user: result,
        message: `User ${result.isAdmin ? 'promoted to' : 'demoted from'} admin`,
      },
    });
  } catch (error) {
    console.error('Admin toggle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle admin status' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { User } from '@/types';

export async function GET() {
  try {
    const user = await getAuthUser();
    
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');
    const inventoryCollection = db.collection('inventory');

    // Get all users
    const users = await usersCollection
      .find({}, { projection: { passwordHash: 0 } })
      .toArray();

    // Get inventory counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const itemCount = await inventoryCollection.countDocuments({ owner: u.username });
        return {
          id: u._id.toString(),
          username: u.username,
          isAdmin: u.isAdmin,
          createdAt: u.createdAt,
          itemCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: { users: usersWithStats },
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');
    const inventoryCollection = db.collection('inventory');
    const vendorsCollection = db.collection('vendors');
    const warehousesCollection = db.collection('warehouses');

    // Get user to delete
    const userToDelete = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!userToDelete) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting admin users
    if (userToDelete.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Delete user's inventory
    await inventoryCollection.deleteMany({ owner: userToDelete.username });
    
    // Delete user's vendors
    await vendorsCollection.deleteMany({ owner: userToDelete.username });
    
    // Delete user's warehouses
    await warehousesCollection.deleteMany({ owner: userToDelete.username });

    // Delete user
    await usersCollection.deleteOne({ _id: new ObjectId(userId) });

    return NextResponse.json({
      success: true,
      data: { message: 'User and all associated data deleted successfully' },
    });
  } catch (error) {
    console.error('Admin user delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

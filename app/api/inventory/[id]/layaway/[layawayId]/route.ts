import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { InventoryItem } from '@/types';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; layawayId: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, layawayId } = await params;

    const db = await getDatabase();
    const inventoryCollection = db.collection<InventoryItem>('inventory');

    // Get current item
    const item = await inventoryCollection.findOne({
      _id: new ObjectId(id),
      owner: user.username,
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    // Find the layaway to remove
    const layawayExists = item.layaways.find(l => l.id === layawayId);
    if (!layawayExists) {
      return NextResponse.json(
        { success: false, error: 'Layaway reservation not found' },
        { status: 404 }
      );
    }

    // Calculate new status
    const newReservedCount = item.reserved - 1;
    let status: InventoryItem['status'] = 'Available';
    if (item.available === 0) {
      status = 'Out of Stock';
    } else if (item.available === 1) {
      status = 'Low Stock';
    } else if (newReservedCount > 0) {
      status = 'Partially Reserved';
    }

    // Remove layaway and decrement reserved count
    const result = await inventoryCollection.findOneAndUpdate(
      { _id: new ObjectId(id), owner: user.username },
      {
        $pull: { layaways: { id: layawayId } },
        $inc: { reserved: -1 },
        $set: { status, updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to remove layaway' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { item: result, message: 'Layaway reservation removed' },
    });
  } catch (error) {
    console.error('Layaway delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove layaway reservation' },
      { status: 500 }
    );
  }
}

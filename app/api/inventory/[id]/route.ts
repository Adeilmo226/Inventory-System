import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { InventoryItem } from '@/types';

// GET - Get single item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const db = await getDatabase();
    const inventoryCollection = db.collection<InventoryItem>('inventory');

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

    return NextResponse.json({
      success: true,
      data: { item },
    });
  } catch (error) {
    console.error('Item fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

// PUT - Update item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { itemNumber, description, available, vendor, warehouse, notes } = body;

    // Validation
    if (!itemNumber || !description || available === undefined || !vendor || !warehouse) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    if (available < 0 || available > 999999) {
      return NextResponse.json(
        { success: false, error: 'Available quantity must be between 0 and 999,999' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const inventoryCollection = db.collection<InventoryItem>('inventory');

    // Get current item to preserve layaways and reserved count
    const currentItem = await inventoryCollection.findOne({
      _id: new ObjectId(id),
      owner: user.username,
    });

    if (!currentItem) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    // Determine status
    let status: InventoryItem['status'] = 'Available';
    if (available === 0) {
      status = 'Out of Stock';
    } else if (available === 1) {
      status = 'Low Stock';
    } else if (currentItem.reserved > 0) {
      status = 'Partially Reserved';
    }

    const updateData = {
      itemNumber: itemNumber.trim(),
      description: description.trim(),
      available,
      vendor: vendor.trim(),
      warehouse: warehouse.trim(),
      notes: notes?.trim() || '',
      status,
      updatedAt: new Date(),
    };

    const result = await inventoryCollection.findOneAndUpdate(
      { _id: new ObjectId(id), owner: user.username },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { item: result },
    });
  } catch (error) {
    console.error('Item update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE - Delete item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const db = await getDatabase();
    const inventoryCollection = db.collection<InventoryItem>('inventory');

    const result = await inventoryCollection.deleteOne({
      _id: new ObjectId(id),
      owner: user.username,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Item deleted successfully' },
    });
  } catch (error) {
    console.error('Item delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}

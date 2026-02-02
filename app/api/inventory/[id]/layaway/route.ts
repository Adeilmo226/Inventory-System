import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { InventoryItem, LayawayReservation } from '@/types';
import { randomUUID } from 'crypto';

export async function POST(
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
    const { customerName, phone, notes } = body;

    // Validation
    if (!customerName || !phone) {
      return NextResponse.json(
        { success: false, error: 'Customer name and phone are required' },
        { status: 400 }
      );
    }

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

    // Create layaway reservation
    const layaway: LayawayReservation = {
      id: randomUUID(),
      customerName: customerName.trim(),
      phone: phone.trim(),
      date: new Date().toISOString().split('T')[0],
      notes: notes?.trim() || '',
    };

    // Update status based on available quantity
    let status: InventoryItem['status'] = item.status;
    if (item.available > 0 && item.reserved + 1 > 0) {
      status = 'Partially Reserved';
    }

    // Add layaway and increment reserved count
    const result = await inventoryCollection.findOneAndUpdate(
      { _id: new ObjectId(id), owner: user.username },
      {
        $push: { layaways: layaway },
        $inc: { reserved: 1 },
        $set: { status, updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to add layaway' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { item: result, layaway },
    });
  } catch (error) {
    console.error('Layaway add error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add layaway reservation' },
      { status: 500 }
    );
  }
}

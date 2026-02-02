import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { InventoryItem } from '@/types';

// GET - List inventory with search and filters
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const vendor = searchParams.get('vendor') || '';
    const warehouse = searchParams.get('warehouse') || '';

    const db = await getDatabase();
    const inventoryCollection = db.collection<InventoryItem>('inventory');

    // Build query
    const query: any = { owner: user.username };

    if (search) {
      query.$or = [
        { itemNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { vendor: { $regex: search, $options: 'i' } },
        { warehouse: { $regex: search, $options: 'i' } },
      ];
    }

    if (vendor) {
      query.vendor = vendor;
    }

    if (warehouse) {
      query.warehouse = warehouse;
    }

    const items = await inventoryCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: { items },
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

// POST - Create new inventory item
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Determine status
    let status: InventoryItem['status'] = 'Available';
    if (available === 0) {
      status = 'Out of Stock';
    } else if (available === 1) {
      status = 'Low Stock';
    }

    const newItem: Omit<InventoryItem, '_id'> = {
      itemNumber: itemNumber.trim(),
      description: description.trim(),
      available,
      vendor: vendor.trim(),
      warehouse: warehouse.trim(),
      reserved: 0,
      status,
      notes: notes?.trim() || '',
      owner: user.username,
      layaways: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await inventoryCollection.insertOne(newItem as any);

    return NextResponse.json({
      success: true,
      data: { 
        item: { ...newItem, _id: result.insertedId.toString() }
      },
    });
  } catch (error) {
    console.error('Inventory create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}

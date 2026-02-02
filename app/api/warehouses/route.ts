import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { Warehouse } from '@/types';

const DEFAULT_WAREHOUSES = ['Small Warehouse', 'Big Warehouse'];

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const warehousesCollection = db.collection<Warehouse>('warehouses');

    // Get user's custom warehouses
    const customWarehouses = await warehousesCollection
      .find({ owner: user.username })
      .toArray();

    // Combine default warehouses with custom warehouses
    const allWarehouses = [
      ...DEFAULT_WAREHOUSES.map(name => ({ name, isDefault: true })),
      ...customWarehouses.map(w => ({ ...w, isDefault: false })),
    ];

    return NextResponse.json({
      success: true,
      data: { warehouses: allWarehouses },
    });
  } catch (error) {
    console.error('Warehouses fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch warehouses' },
      { status: 500 }
    );
  }
}

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
    const { name } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Warehouse name is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const warehousesCollection = db.collection<Warehouse>('warehouses');

    // Check if warehouse already exists (including defaults)
    if (DEFAULT_WAREHOUSES.includes(name.trim())) {
      return NextResponse.json(
        { success: false, error: 'This warehouse already exists as a default option' },
        { status: 409 }
      );
    }

    const existing = await warehousesCollection.findOne({
      name: name.trim(),
      owner: user.username,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Warehouse already exists' },
        { status: 409 }
      );
    }

    const newWarehouse: Omit<Warehouse, '_id'> = {
      name: name.trim(),
      owner: user.username,
    };

    const result = await warehousesCollection.insertOne(newWarehouse as any);

    return NextResponse.json({
      success: true,
      data: { 
        warehouse: { ...newWarehouse, _id: result.insertedId.toString() }
      },
    });
  } catch (error) {
    console.error('Warehouse create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create warehouse' },
      { status: 500 }
    );
  }
}

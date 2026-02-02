import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { Vendor } from '@/types';

const DEFAULT_VENDORS = ['Ashley', 'Nationwide', 'Coaster', 'Global'];

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
    const vendorsCollection = db.collection<Vendor>('vendors');

    // Get user's custom vendors
    const customVendors = await vendorsCollection
      .find({ owner: user.username })
      .toArray();

    // Combine default vendors with custom vendors
    const allVendors = [
      ...DEFAULT_VENDORS.map(name => ({ name, isDefault: true })),
      ...customVendors.map(v => ({ ...v, isDefault: false })),
    ];

    return NextResponse.json({
      success: true,
      data: { vendors: allVendors },
    });
  } catch (error) {
    console.error('Vendors fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendors' },
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
        { success: false, error: 'Vendor name is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const vendorsCollection = db.collection<Vendor>('vendors');

    // Check if vendor already exists (including defaults)
    if (DEFAULT_VENDORS.includes(name.trim())) {
      return NextResponse.json(
        { success: false, error: 'This vendor already exists as a default option' },
        { status: 409 }
      );
    }

    const existing = await vendorsCollection.findOne({
      name: name.trim(),
      owner: user.username,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Vendor already exists' },
        { status: 409 }
      );
    }

    const newVendor: Omit<Vendor, '_id'> = {
      name: name.trim(),
      owner: user.username,
    };

    const result = await vendorsCollection.insertOne(newVendor as any);

    return NextResponse.json({
      success: true,
      data: { 
        vendor: { ...newVendor, _id: result.insertedId.toString() }
      },
    });
  } catch (error) {
    console.error('Vendor create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}

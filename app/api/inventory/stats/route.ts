import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { InventoryItem, DashboardStats } from '@/types';

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
    const inventoryCollection = db.collection<InventoryItem>('inventory');

    // Get all user's inventory
    const items = await inventoryCollection
      .find({ owner: user.username })
      .toArray();

    // Calculate statistics
    const stats: DashboardStats = {
      totalItems: items.length,
      inStock: items.filter(item => item.available > 0).length,
      reserved: items.reduce((sum, item) => sum + item.reserved, 0),
      lowStock: items.filter(item => item.available === 1).length,
    };

    return NextResponse.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

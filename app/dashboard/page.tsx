'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InventoryItem, DashboardStats } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    inStock: 0,
    reserved: 0,
    lowStock: 0,
  });
  const [search, setSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<string[]>([]);
  const [warehouses, setWarehouses] = useState<string[]>([]);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLayawayModal, setShowLayawayModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [layawayItem, setLayawayItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, [search, vendorFilter, warehouseFilter]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (!data.success) {
        router.push('/login');
      } else {
        setUser(data.data.user);
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (vendorFilter) params.append('vendor', vendorFilter);
      if (warehouseFilter) params.append('warehouse', warehouseFilter);

      const [itemsRes, statsRes, vendorsRes, warehousesRes] = await Promise.all([
        fetch(`/api/inventory?${params}`),
        fetch('/api/inventory/stats'),
        fetch('/api/vendors'),
        fetch('/api/warehouses'),
      ]);

      const [itemsData, statsData, vendorsData, warehousesData] = await Promise.all([
        itemsRes.json(),
        statsRes.json(),
        vendorsRes.json(),
        warehousesRes.json(),
      ]);

      if (itemsData.success) setItems(itemsData.data.items);
      if (statsData.success) setStats(statsData.data.stats);
      if (vendorsData.success) {
        setVendors(vendorsData.data.vendors.map((v: any) => v.name));
      }
      if (warehousesData.success) {
        setWarehouses(warehousesData.data.warehouses.map((w: any) => w.name));
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return;

    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      alert('Failed to delete item');
    }
  };

const getStatusBadge = (item: InventoryItem) => {
  if (item.available === 0) {
    return <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800 whitespace-nowrap">Out of Stock</span>;
  }
  if (item.available === 1) {
    return <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800 whitespace-nowrap">Low Stock</span>;
  }
  if (item.reserved > 0) {
    return <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 whitespace-nowrap">Partially Reserved</span>;
  }
  return <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800 whitespace-nowrap">Available</span>;
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4" style={{ maxWidth: '1800px' }}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Inventory Management
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Welcome back, {user?.username}
              </p>
            </div>
            <div className="flex gap-3">
              {user?.isAdmin && (
                <button
                  onClick={() => router.push('/admin')}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                >
                  Admin Panel
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '1800px' }}>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-sm font-medium text-slate-600 mb-1">Total Items</p>
            <p className="text-3xl font-semibold text-slate-900">{stats.totalItems}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-sm font-medium text-slate-600 mb-1">In Stock</p>
            <p className="text-3xl font-semibold text-slate-900">{stats.inStock}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-sm font-medium text-slate-600 mb-1">Reserved</p>
            <p className="text-3xl font-semibold text-blue-600">{stats.reserved}</p>
          </div>
		<div className="bg-white rounded-lg p-6 border border-slate-200">
		<p className="text-sm font-medium text-slate-600 mb-1">Low Stock</p>
		<p className="text-3xl font-semibold text-red-600">{stats.lowStock}</p>
		</div>
        </div>

        {/* Filters and Add Button */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <input
              type="search"
              placeholder="Search by item #, description, vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor} value={vendor}>{vendor}</option>
            ))}
          </select>
          
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse} value={warehouse}>{warehouse}</option>
            ))}
          </select>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Item #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Available</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Warehouse</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Reserved</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-slate-600 font-medium">No inventory items yet</p>
                        <p className="text-sm text-slate-500">Click "Add Item" to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item._id.toString().toString().toString()} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-1000">{item.itemNumber}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.description}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">{item.available}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.vendor}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.warehouse}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">{item.reserved}</td>
                      <td className="px-4 py-3">{getStatusBadge(item)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.notes || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setLayawayItem(item);
                              setShowLayawayModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Layaway"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setShowEditModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                            title="Edit"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteItem(item._id.toString().toString().toString())}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showAddModal && (
        <AddItemModal
          vendors={vendors}
          warehouses={warehouses}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchData();
          }}
        />
      )}

      {showEditModal && editingItem && (
        <EditItemModal
          item={editingItem}
          vendors={vendors}
          warehouses={warehouses}
          onClose={() => {
            setShowEditModal(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingItem(null);
            fetchData();
          }}
        />
      )}

      {showLayawayModal && layawayItem && (
        <LayawayModal
          item={layawayItem}
          onClose={() => {
            setShowLayawayModal(false);
            setLayawayItem(null);
          }}
          onSuccess={() => {
            setShowLayawayModal(false);
            setLayawayItem(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

// Add Item Modal with ability to add new vendors/warehouses
function AddItemModal({ vendors, warehouses, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    itemNumber: '',
    description: '',
    available: 0,
    vendor: '',
    warehouse: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [showNewVendor, setShowNewVendor] = useState(false);
  const [showNewWarehouse, setShowNewWarehouse] = useState(false);
  const [newVendor, setNewVendor] = useState('');
  const [newWarehouse, setNewWarehouse] = useState('');

  const handleAddVendor = async () => {
    if (!newVendor.trim()) return;
    
    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newVendor }),
      });
      
      if (response.ok) {
        setFormData({ ...formData, vendor: newVendor });
        setNewVendor('');
        setShowNewVendor(false);
        alert('Vendor added! Refresh to see in dropdown.');
      }
    } catch (error) {
      alert('Failed to add vendor');
    }
  };

  const handleAddWarehouse = async () => {
    if (!newWarehouse.trim()) return;
    
    try {
      const response = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWarehouse }),
      });
      
      if (response.ok) {
        setFormData({ ...formData, warehouse: newWarehouse });
        setNewWarehouse('');
        setShowNewWarehouse(false);
        alert('Warehouse added! Refresh to see in dropdown.');
      }
    } catch (error) {
      alert('Failed to add warehouse');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert('Failed to add item');
      }
    } catch (error) {
      alert('Error adding item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Add New Item</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Item Number *</label>
              <input
                type="text"
                required
                value={formData.itemNumber}
                onChange={(e) => setFormData({ ...formData, itemNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Available Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.available}
                onChange={(e) => setFormData({ ...formData, available: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vendor *</label>
              {!showNewVendor ? (
                <div className="flex gap-2">
                  <select
                    required={!showNewVendor}
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select vendor...</option>
                    {vendors.map((v: string) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewVendor(true)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    title="Add new vendor"
                  >
                    +
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newVendor}
                    onChange={(e) => setNewVendor(e.target.value)}
                    placeholder="New vendor name"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddVendor}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewVendor(false)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    ✗
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Warehouse *</label>
              {!showNewWarehouse ? (
                <div className="flex gap-2">
                  <select
                    required={!showNewWarehouse}
                    value={formData.warehouse}
                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select warehouse...</option>
                    {warehouses.map((w: string) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewWarehouse(true)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    title="Add new warehouse"
                  >
                    +
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newWarehouse}
                    onChange={(e) => setNewWarehouse(e.target.value)}
                    placeholder="New warehouse name"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddWarehouse}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewWarehouse(false)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    ✗
                  </button>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Item Modal
function EditItemModal({ item, vendors, warehouses, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    itemNumber: item.itemNumber,
    description: item.description,
    available: item.available,
    vendor: item.vendor,
    warehouse: item.warehouse,
    notes: item.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [showNewVendor, setShowNewVendor] = useState(false);
  const [showNewWarehouse, setShowNewWarehouse] = useState(false);
  const [newVendor, setNewVendor] = useState('');
  const [newWarehouse, setNewWarehouse] = useState('');

  const handleAddVendor = async () => {
    if (!newVendor.trim()) return;
    
    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newVendor }),
      });
      
      if (response.ok) {
        setFormData({ ...formData, vendor: newVendor });
        setNewVendor('');
        setShowNewVendor(false);
        alert('Vendor added! Refresh to see in dropdown.');
      }
    } catch (error) {
      alert('Failed to add vendor');
    }
  };

  const handleAddWarehouse = async () => {
    if (!newWarehouse.trim()) return;
    
    try {
      const response = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWarehouse }),
      });
      
      if (response.ok) {
        setFormData({ ...formData, warehouse: newWarehouse });
        setNewWarehouse('');
        setShowNewWarehouse(false);
        alert('Warehouse added! Refresh to see in dropdown.');
      }
    } catch (error) {
      alert('Failed to add warehouse');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/inventory/${item._id.toString().toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert('Failed to update item');
      }
    } catch (error) {
      alert('Error updating item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Edit Item</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Item Number *</label>
              <input
                type="text"
                required
                value={formData.itemNumber}
                onChange={(e) => setFormData({ ...formData, itemNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Available Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.available}
                onChange={(e) => setFormData({ ...formData, available: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vendor *</label>
              {!showNewVendor ? (
                <div className="flex gap-2">
                  <select
                    required={!showNewVendor}
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select vendor...</option>
                    {vendors.map((v: string) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewVendor(true)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    +
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newVendor}
                    onChange={(e) => setNewVendor(e.target.value)}
                    placeholder="New vendor name"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddVendor}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewVendor(false)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    ✗
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Warehouse *</label>
              {!showNewWarehouse ? (
                <div className="flex gap-2">
                  <select
                    required={!showNewWarehouse}
                    value={formData.warehouse}
                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select warehouse...</option>
                    {warehouses.map((w: string) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewWarehouse(true)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    +
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newWarehouse}
                    onChange={(e) => setNewWarehouse(e.target.value)}
                    placeholder="New warehouse name"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddWarehouse}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewWarehouse(false)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    ✗
                  </button>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Layaway Modal
function LayawayModal({ item, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'add' | 'view'>(item.layaways?.length > 0 ? 'view' : 'add');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/inventory/${item._id.toString().toString()}/layaway`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert('Failed to add layaway');
      }
    } catch (error) {
      alert('Error adding layaway');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLayaway = async (layawayId: string) => {
    if (!confirm('Remove this layaway reservation?')) return;

    try {
      const response = await fetch(`/api/inventory/${item._id.toString().toString()}/layaway/${layawayId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert('Failed to remove layaway');
      }
    } catch (error) {
      alert('Error removing layaway');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Layaway Reservations</h2>
              <p className="text-sm text-slate-600 mt-1">
                Item: <span className="font-medium">{item.itemNumber}</span> - {item.description}
              </p>
            </div>
            {item.layaways?.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('view')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    viewMode === 'view' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  View ({item.layaways.length})
                </button>
                <button
                  onClick={() => setViewMode('add')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    viewMode === 'add' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Add New
                </button>
              </div>
            )}
          </div>
        </div>

        {viewMode === 'add' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                This will reserve 1 unit for the customer. The item will not be removed from available stock.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Reservation'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            {item.layaways && item.layaways.length > 0 ? (
              <div className="space-y-3">
                {item.layaways.map((layaway: any) => (
                  <div key={layaway.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{layaway.customerName}</h3>
                        <p className="text-sm text-slate-600">{layaway.phone}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveLayaway(layaway.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p>Date: {layaway.date}</p>
                      {layaway.notes && <p className="mt-1">Notes: {layaway.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600">No layaway reservations</p>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
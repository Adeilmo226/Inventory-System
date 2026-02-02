import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  username: string;
  passwordHash: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface LayawayReservation {
  id: string;
  customerName: string;
  phone: string;
  date: string;
  notes?: string;
}

export interface InventoryItem {
  _id: ObjectId;
  itemNumber: string;
  description: string;
  available: number;
  vendor: string;
  warehouse: string;
  reserved: number;
  status: 'Available' | 'Low Stock' | 'Out of Stock' | 'Partially Reserved';
  notes?: string;
  owner: string;
  layaways: LayawayReservation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendor {
  _id: ObjectId;
  name: string;
  owner: string;
}

export interface Warehouse {
  _id: ObjectId;
  name: string;
  owner: string;
}

export interface DashboardStats {
  totalItems: number;
  inStock: number;
  reserved: number;
  lowStock: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
import { z } from 'zod'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1),
})

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const CategorySchema = z.object({
  name: z.string().min(1).max(100),
  displayOrder: z.number().int().default(0),
  active: z.boolean().default(true),
})

export const MenuItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  veg: z.boolean().default(false),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  available: z.boolean().default(true),
  bestSeller: z.boolean().default(false),
})

// ─── Tables ───────────────────────────────────────────────────────────────────

export const TableSchema = z.object({
  number: z.number().int().positive(),
  capacity: z.number().int().positive(),
  section: z.string().optional(),
})

export const TableStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING']),
  waiterId: z.string().uuid().optional(),
})

// ─── Orders ───────────────────────────────────────────────────────────────────

export const OrderItemInput = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
})

export const CreateOrderSchema = z.object({
  tableId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  orderType: z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY']).default('DINE_IN'),
  notes: z.string().optional(),
  items: z.array(OrderItemInput).min(1),
})

export const AddItemsSchema = z.object({
  items: z.array(OrderItemInput).min(1),
})

export const UpdateItemSchema = z.object({
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
})

export const OrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'PAID', 'CANCELLED']),
})

// ─── Payments ─────────────────────────────────────────────────────────────────

export const PaymentSplitInput = z.object({
  method: z.enum(['CASH', 'CARD', 'UPI', 'WALLET']),
  amount: z.number().positive(),
})

export const PaymentSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum(['CASH', 'CARD', 'UPI', 'WALLET', 'SPLIT']),
  splits: z.array(PaymentSplitInput).optional(),
  reference: z.string().optional(),
})

// ─── Reservations ─────────────────────────────────────────────────────────────

export const ReservationSchema = z.object({
  guestName: z.string().min(1),
  guestPhone: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  partySize: z.number().int().positive(),
  tableId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  notes: z.string().optional(),
})

export const ReservationStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']),
})

// ─── Inventory ────────────────────────────────────────────────────────────────

export const InventoryItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().min(1),
  currentStock: z.number().nonnegative(),
  reorderLevel: z.number().nonnegative(),
})

export const InventoryAdjustSchema = z.object({
  quantity: z.number(),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'WASTE']),
  notes: z.string().optional(),
})

// ─── Employees ────────────────────────────────────────────────────────────────

export const EmployeeSchema = z.object({
  name: z.string().min(1),
  role: z.enum(['MANAGER', 'HEAD_WAITER', 'WAITER', 'CASHIER', 'KITCHEN_STAFF', 'CHEF']),
  phone: z.string().optional(),
  email: z.string().email().optional(),
})

export const EmployeeUserSchema = EmployeeSchema.extend({
  password: z.string().min(6).optional(),
  userRole: z.enum(['SUPER_ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN']).optional(),
})

// ─── CRM ──────────────────────────────────────────────────────────────────────

export const CustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
})

import { MenuItem } from './menu.model';
export interface Table { id: number; number: number; capacity: number; is_occupied: boolean; location: string; }
export type OrderStatus = 'pending'|'confirmed'|'preparing'|'ready'|'served'|'cancelled';
export type PaymentStatus = 'unpaid'|'paid'|'refunded';
export interface OrderItem {
  id?: number; menu_item: number; menu_item_detail?: MenuItem;
  quantity: number; unit_price?: number; special_request?: string; subtotal?: number;
}
export interface Order {
  id: number; user: number; user_name: string; table?: number; table_number?: number;
  status: OrderStatus; payment_status: PaymentStatus; payment_method?: string;
  notes?: string; total_amount: number; items: OrderItem[]; created_at: string; updated_at: string;
}
export interface Reservation {
  id: number; user: number; user_name: string; table: number; table_detail?: Table;
  date: string; time: string; party_size: number; status: string; notes?: string; created_at: string;
}
export interface OrderSummary {
  total_orders: number; pending: number; preparing: number; served: number; cancelled: number; total_spent: number;
}

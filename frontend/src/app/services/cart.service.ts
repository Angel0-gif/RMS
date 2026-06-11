import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MenuItem } from '../models/menu.model';

export interface CartItem { item: MenuItem; quantity: number; special_request: string; }

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  get items(): CartItem[] { return this.cartSubject.value; }
  get count(): number { return this.items.reduce((s, i) => s + i.quantity, 0); }
  get total(): number { return this.items.reduce((s, i) => s + (i.item.price * i.quantity), 0); }

  addItem(item: MenuItem) {
    const cur = [...this.items];
    const idx = cur.findIndex(c => c.item.id === item.id);
    if (idx >= 0) cur[idx].quantity++;
    else cur.push({ item, quantity: 1, special_request: '' });
    this.cartSubject.next(cur);
  }

  removeItem(itemId: number) {
    this.cartSubject.next(this.items.filter(c => c.item.id !== itemId));
  }

  updateQuantity(itemId: number, qty: number) {
    if (qty <= 0) { this.removeItem(itemId); return; }
    const cur = this.items.map(c => c.item.id === itemId ? { ...c, quantity: qty } : c);
    this.cartSubject.next(cur);
  }

  clear() { this.cartSubject.next([]); }
}

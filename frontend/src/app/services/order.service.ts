import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, Table, Reservation, OrderSummary } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private base = `${environment.apiUrl}/orders`;
  constructor(private http: HttpClient) {}

  getTables(): Observable<any> { return this.http.get(`${this.base}/tables/`); }

  getOrders(): Observable<any> { return this.http.get(`${this.base}/orders/`); }
  getOrder(id: number): Observable<Order> { return this.http.get<Order>(`${this.base}/orders/${id}/`); }
  createOrder(data: Partial<Order>): Observable<Order> { return this.http.post<Order>(`${this.base}/orders/`, data); }
  updateOrder(id: number, data: Partial<Order>): Observable<Order> { return this.http.patch<Order>(`${this.base}/orders/${id}/`, data); }
  deleteOrder(id: number): Observable<any> { return this.http.delete(`${this.base}/orders/${id}/`); }
  updateStatus(id: number, status: string): Observable<Order> { return this.http.patch<Order>(`${this.base}/orders/${id}/update_status/`, { status }); }
  payOrder(id: number, method: string): Observable<Order> { return this.http.patch<Order>(`${this.base}/orders/${id}/pay/`, { payment_method: method }); }
  getOrderSummary(): Observable<OrderSummary> { return this.http.get<OrderSummary>(`${this.base}/orders/summary/`); }

  getReservations(): Observable<any> { return this.http.get(`${this.base}/reservations/`); }
  createReservation(data: Partial<Reservation>): Observable<Reservation> { return this.http.post<Reservation>(`${this.base}/reservations/`, data); }
  updateReservation(id: number, data: Partial<Reservation>): Observable<Reservation> { return this.http.patch<Reservation>(`${this.base}/reservations/${id}/`, data); }
  deleteReservation(id: number): Observable<any> { return this.http.delete(`${this.base}/reservations/${id}/`); }
}

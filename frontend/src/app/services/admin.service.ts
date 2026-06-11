import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── CATEGORIES ──
  getCategories(): Observable<any> { return this.http.get(`${this.base}/menu/categories/`); }
  createCategory(data: any): Observable<any> { return this.http.post(`${this.base}/menu/categories/`, data); }
  updateCategory(id: number, data: any): Observable<any> { return this.http.patch(`${this.base}/menu/categories/${id}/`, data); }
  deleteCategory(id: number): Observable<any> { return this.http.delete(`${this.base}/menu/categories/${id}/`); }

  // ── MENU ITEMS ──
  getMenuItems(params?: any): Observable<any> {
    let p = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k] !== undefined && params[k] !== '') p = p.set(k, String(params[k])); });
    return this.http.get(`${this.base}/menu/items/`, { params: p });
  }
  createMenuItem(data: any): Observable<any> { return this.http.post(`${this.base}/menu/items/`, data); }
  updateMenuItem(id: number, data: any): Observable<any> { return this.http.patch(`${this.base}/menu/items/${id}/`, data); }
  deleteMenuItem(id: number): Observable<any> { return this.http.delete(`${this.base}/menu/items/${id}/`); }

  // ── TABLES ──
  getTables(): Observable<any> { return this.http.get(`${this.base}/orders/tables/`); }
  createTable(data: any): Observable<any> { return this.http.post(`${this.base}/orders/tables/`, data); }
  updateTable(id: number, data: any): Observable<any> { return this.http.patch(`${this.base}/orders/tables/${id}/`, data); }
  deleteTable(id: number): Observable<any> { return this.http.delete(`${this.base}/orders/tables/${id}/`); }

  // ── ORDERS (admin sees all) ──
  getAllOrders(params?: any): Observable<any> {
    let p = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k]) p = p.set(k, String(params[k])); });
    return this.http.get(`${this.base}/orders/orders/`, { params: p });
  }
  createOrder(data: any): Observable<any> { return this.http.post(`${this.base}/orders/orders/`, data); }
  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.base}/orders/orders/${id}/update_status/`, { status });
  }
  markOrderPaid(id: number, method = 'cash'): Observable<any> {
    return this.http.patch(`${this.base}/orders/orders/${id}/pay/`, { payment_method: method });
  }
  deleteOrder(id: number): Observable<any> { return this.http.delete(`${this.base}/orders/orders/${id}/`); }

  // ── RESERVATIONS (admin sees all) ──
  getAllReservations(params?: any): Observable<any> {
    let p = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k]) p = p.set(k, String(params[k])); });
    return this.http.get(`${this.base}/orders/reservations/`, { params: p });
  }
  createReservation(data: any): Observable<any> { return this.http.post(`${this.base}/orders/reservations/`, data); }
  updateReservation(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.base}/orders/reservations/${id}/`, data);
  }
  deleteReservation(id: number): Observable<any> { return this.http.delete(`${this.base}/orders/reservations/${id}/`); }

  // ── DAILY REPORT ──
  getDailyReport(date?: string): Observable<any> {
    let p = new HttpParams();
    if (date) p = p.set('date', date);
    return this.http.get(`${this.base}/orders/orders/daily_report/`, { params: p });
  }
}

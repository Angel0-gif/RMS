import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category, MenuItem } from '../models/menu.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private base = `${environment.apiUrl}/menu`;
  constructor(private http: HttpClient) {}

  getCategories(): Observable<any> { return this.http.get(`${this.base}/categories/`); }
  createCategory(data: Partial<Category>): Observable<Category> { return this.http.post<Category>(`${this.base}/categories/`, data); }
  updateCategory(id: number, data: Partial<Category>): Observable<Category> { return this.http.patch<Category>(`${this.base}/categories/${id}/`, data); }
  deleteCategory(id: number): Observable<any> { return this.http.delete(`${this.base}/categories/${id}/`); }

  getMenuItems(params?: any): Observable<any> {
    let p = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k]) p = p.set(k, params[k]); });
    return this.http.get(`${this.base}/items/`, { params: p });
  }
  getFeaturedItems(): Observable<MenuItem[]> { return this.http.get<MenuItem[]>(`${this.base}/items/featured/`); }
  getMenuItem(id: number): Observable<MenuItem> { return this.http.get<MenuItem>(`${this.base}/items/${id}/`); }
  createMenuItem(data: FormData): Observable<MenuItem> { return this.http.post<MenuItem>(`${this.base}/items/`, data); }
  updateMenuItem(id: number, data: FormData | Partial<MenuItem>): Observable<MenuItem> { return this.http.patch<MenuItem>(`${this.base}/items/${id}/`, data); }
  deleteMenuItem(id: number): Observable<any> { return this.http.delete(`${this.base}/items/${id}/`); }
}

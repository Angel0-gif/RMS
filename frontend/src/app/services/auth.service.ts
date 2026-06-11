import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getUserFromStorage(): User | null {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  get currentUser(): User | null { return this.currentUserSubject.value; }
  get isLoggedIn(): boolean { return !!this.getToken(); }
  getToken(): string | null { return localStorage.getItem('access_token'); }
  getRefreshToken(): string | null { return localStorage.getItem('refresh_token'); }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login/`, data).pipe(
      tap(res => this.storeAuth(res))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register/`, data).pipe(
      tap(res => this.storeAuth(res))
    );
  }

  logout(): Observable<any> {
    const body = { refresh: this.getRefreshToken() };
    return this.http.post(`${this.apiUrl}/auth/logout/`, body).pipe(
      tap(() => this.clearAuth())
    );
  }

  refreshToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/token/refresh/`, { refresh: this.getRefreshToken() }).pipe(
      tap((res: any) => localStorage.setItem('access_token', res.access))
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/profile/`).pipe(
      tap(user => { localStorage.setItem('user', JSON.stringify(user)); this.currentUserSubject.next(user); })
    );
  }

  updateProfile(data: FormData | Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/auth/profile/`, data).pipe(
      tap(user => { localStorage.setItem('user', JSON.stringify(user)); this.currentUserSubject.next(user); })
    );
  }

  changePassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-password/`, data);
  }

  private storeAuth(res: AuthResponse) {
    localStorage.setItem('access_token', res.access);
    localStorage.setItem('refresh_token', res.refresh);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
  }

  clearAuth() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
}

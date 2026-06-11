export interface User {
  id: number; email: string; username: string;
  first_name: string; last_name: string; full_name: string;
  phone: string; role: 'customer'|'staff'|'manager';
  avatar?: string; avatar_url?: string; bio?: string;
  address?: string; date_of_birth?: string;
  created_at: string; updated_at: string;
}
export interface AuthResponse { access: string; refresh: string; user: User; }
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest {
  email: string; username: string; first_name: string; last_name: string;
  password: string; password2: string; phone?: string; role?: string;
}

import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const user = this.authService.currentUser;
    if (!user) {
      // Not logged in → go to login
      return this.router.createUrlTree(['/login']);
    }
    if (user.role === 'manager' || user.role === 'staff') {
      // Admin/staff → allowed
      return true;
    }
    // Logged in as customer → redirect to their dashboard, not admin
    return this.router.createUrlTree(['/dashboard']);
  }
}

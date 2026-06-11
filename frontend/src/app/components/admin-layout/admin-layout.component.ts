import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  user: User | null = null;
  sidebarOpen = false;  // mobile off-canvas state; desktop sidebar is always visible via CSS

  onSidebarClick(event: Event) {
    // Close the mobile sidebar when a navigation link is tapped
    const target = event.target as HTMLElement;
    if (target.closest('a')) this.sidebarOpen = false;
  }

  navSections = [
    {
      label: 'OVERVIEW',
      items: [
        { icon: 'dashboard', label: 'Dashboard', route: '/admin/dashboard', svg: 'dashboard' },
      ]
    },
    {
      label: 'MANAGEMENT',
      items: [
        { icon: 'grid', label: 'Categories', route: '/admin/categories', svg: 'categories' },
        { icon: 'menu', label: 'Menu Items', route: '/admin/menu-items', svg: 'menu' },
        { icon: 'tables', label: 'Tables', route: '/admin/tables', svg: 'tables' },
        { icon: 'orders', label: 'Orders', route: '/admin/orders', svg: 'orders' },
        { icon: 'grid', label: 'Reservations', route: '/admin/reservations', svg: 'reservations' },
      ]
    },
    {
      label: 'FINANCE',
      items: [
        { icon: 'billing', label: 'Billing', route: '/admin/billing', svg: 'billing' },
        { icon: 'reports', label: 'Reports', route: '/admin/reports', svg: 'reports' },
      ]
    }
  ];

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.user = this.authService.currentUser;
  }

  getInitials(): string {
    return `${this.user?.first_name?.[0] || ''}${this.user?.last_name?.[0] || ''}`.toUpperCase();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => { this.authService.clearAuth(); this.router.navigate(['/']); }
    });
  }
}

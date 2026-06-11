import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { User } from '../../models/user.model';
import { Order, OrderSummary } from '../../models/order.model';

@Component({ selector: 'app-dashboard', templateUrl: './dashboard.component.html', styleUrls: ['./dashboard.component.scss'] })
export class DashboardComponent implements OnInit {
  user: User | null = null;
  summary: OrderSummary | null = null;
  recentOrders: Order[] = [];
  loading = true;

  constructor(private authService: AuthService, private orderService: OrderService, private router: Router) {}

  ngOnInit() {
    this.user = this.authService.currentUser;
    // Redirect admins to admin panel
    if (this.user?.role === 'manager' || this.user?.role === 'staff') {
      this.router.navigate(['/admin']);
      return;
    }
    this.loadData();
  }

  loadData() {
    this.orderService.getOrderSummary().subscribe({ next: s => this.summary = s, error: () => {} });
    this.orderService.getOrders().subscribe({
      next: res => { this.recentOrders = (res.results || res).slice(0, 5); this.loading = false; },
      error: () => this.loading = false
    });
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning'; if (h < 17) return 'afternoon'; return 'evening';
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => { this.authService.clearAuth(); this.router.navigate(['/']); }
    });
  }

  getStatusClass(status: string): string {
    const map: any = { pending:'warning', confirmed:'info', preparing:'primary', ready:'success', served:'secondary', cancelled:'danger' };
    return `badge bg-${map[status] || 'secondary'}`;
  }
}

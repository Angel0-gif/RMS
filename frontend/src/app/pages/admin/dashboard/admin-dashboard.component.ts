import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats = { totalOrders: 0, pendingOrders: 0, revenue: 0, menuItems: 0, reservations: 0, categories: 0 };
  recentOrders: any[] = [];
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.adminService.getAllOrders().subscribe({
      next: res => {
        const orders = res.results || res;
        this.recentOrders = orders.slice(0, 8);
        this.stats.totalOrders = orders.length;
        this.stats.pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
        this.stats.revenue = orders.filter((o: any) => o.payment_status === 'paid')
          .reduce((s: number, o: any) => s + parseFloat(o.total_amount), 0);
        this.loading = false;
      }
    });
    this.adminService.getMenuItems().subscribe({ next: res => this.stats.menuItems = (res.results || res).length });
    this.adminService.getCategories().subscribe({ next: res => this.stats.categories = (res.results || res).length });
    this.adminService.getAllReservations().subscribe({ next: res => this.stats.reservations = (res.results || res).length });
  }

  statusClass(s: string): string {
    const m: any = { pending: 'warning', confirmed: 'info', preparing: 'primary', ready: 'success', served: 'secondary', cancelled: 'danger' };
    return `badge bg-${m[s] || 'secondary'}`;
  }
}

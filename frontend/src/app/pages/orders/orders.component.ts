import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Order } from '../../models/order.model';
import { User } from '../../models/user.model';

@Component({ selector: 'app-orders', templateUrl: './orders.component.html', styleUrls: ['./orders.component.scss'] })
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  user: User | null = null;
  loading = false;
  filterStatus = '';

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUser;
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getOrders().subscribe({
      next: res => { this.orders = res.results || res; this.loading = false; },
      error: () => this.loading = false
    });
  }

  get filteredOrders(): Order[] {
    if (!this.filterStatus) return this.orders;
    return this.orders.filter(o => o.status === this.filterStatus);
  }

  viewOrder(order: Order) { this.selectedOrder = order; }
  closeDetail() { this.selectedOrder = null; }

  cancelOrder(id: number) {
    if (!confirm('Cancel this order?')) return;
    this.orderService.updateStatus(id, 'cancelled').subscribe({
      next: updated => {
        this.orders = this.orders.map(o => o.id === id ? updated : o);
        if (this.selectedOrder?.id === id) this.selectedOrder = updated;
        this.toast.success('Order cancelled.');
      },
      error: err => this.toast.error(err.error?.error || 'Cannot cancel this order.')
    });
  }

  payOrder(id: number) {
    this.orderService.payOrder(id, 'cash').subscribe({
      next: updated => {
        this.orders = this.orders.map(o => o.id === id ? updated : o);
        if (this.selectedOrder?.id === id) this.selectedOrder = updated;
        this.toast.success('Payment recorded!');
      },
      error: err => this.toast.error(err.error?.error || 'Payment failed.')
    });
  }

  getStatusClass(s: string) {
    const m: any = { pending:'warning', confirmed:'info', preparing:'primary', ready:'success', served:'secondary', cancelled:'danger' };
    return `badge bg-${m[s]||'secondary'}`;
  }

  getPayClass(s: string) {
    return `badge bg-${s==='paid'?'success':s==='refunded'?'info':'warning'}`;
  }

  logout() {
    this.authService.logout().subscribe({ next: () => this.router.navigate(['/']), error: () => { this.authService.clearAuth(); this.router.navigate(['/']); } });
  }
}

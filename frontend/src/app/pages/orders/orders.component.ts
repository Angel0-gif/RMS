import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Order } from '../../models/order.model';
import { User } from '../../models/user.model';

@Component({ selector: 'app-orders', templateUrl: './orders.component.html', styleUrls: ['./orders.component.scss'] })
export class OrdersComponent implements OnInit, OnDestroy {
  private refreshTimer: any;
  private payPollTimer: any;
  payModalOpen = false;
  payPhone = '';
  payState: 'idle' | 'waiting' | 'success' | 'failed' = 'idle';
  payError = '';
  payOperator = '';
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
    this.refreshTimer = setInterval(() => this.loadOrders(true), 10000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshTimer);
    clearInterval(this.payPollTimer);
  }

  loadOrders(silent = false) {
    if (!silent) this.loading = true;
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

  openPayModal() {
    this.payModalOpen = true;
    this.payState = 'idle';
    this.payError = '';
    this.payPhone = '';
  }

  closePayModal() {
    this.payModalOpen = false;
    clearInterval(this.payPollTimer);
    if (this.payState === 'waiting') this.payState = 'idle';
  }

  startMomoPayment() {
    if (!this.selectedOrder) return;
    const phone = this.payPhone.replace(/\s+/g, '');
    if (!/^(237)?6\d{8}$/.test(phone)) {
      this.payError = 'Enter a valid number, e.g. 6XX XXX XXX';
      return;
    }
    this.payError = '';
    this.payState = 'waiting';
    const orderId = this.selectedOrder.id;
    this.orderService.initiateMomoPayment(orderId, phone).subscribe({
      next: res => {
        this.payOperator = res.operator === 'ORANGE' ? 'Orange Money' : 'MTN MoMo';
        this.pollMomo(orderId, Date.now());
      },
      error: err => {
        this.payState = 'failed';
        this.payError = err.error?.error || 'Could not start the payment. Try again.';
      }
    });
  }

  private pollMomo(orderId: number, startedAt: number) {
    clearInterval(this.payPollTimer);
    this.payPollTimer = setInterval(() => {
      if (Date.now() - startedAt > 120000) {  // give up after 2 minutes
        clearInterval(this.payPollTimer);
        this.payState = 'failed';
        this.payError = 'Payment timed out. No charge was made if you did not confirm.';
        return;
      }
      this.orderService.getMomoStatus(orderId).subscribe({
        next: res => {
          if (res.status === 'successful') {
            clearInterval(this.payPollTimer);
            this.payState = 'success';
            this.toast.success(`Payment received via ${this.payOperator}. Thank you!`);
            this.loadOrders(true);
            if (this.selectedOrder?.id === orderId) {
              this.selectedOrder.payment_status = 'paid';
            }
            setTimeout(() => this.closePayModal(), 2500);
          } else if (res.status === 'failed') {
            clearInterval(this.payPollTimer);
            this.payState = 'failed';
            this.payError = 'The payment was declined or cancelled.';
          }
        }
      });
    }, 4000);
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

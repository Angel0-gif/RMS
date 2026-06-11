import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';

@Component({ selector: 'app-admin-billing', templateUrl: './admin-billing.component.html', styleUrls: ['./admin-billing.component.scss'] })
export class AdminBillingComponent implements OnInit, OnDestroy {
  private refreshTimer: any;
  orders: any[] = [];
  loading = false;
  filterPayment = '';

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
    this.refreshTimer = setInterval(() => this.load(true), 10000);
  }

  ngOnDestroy() { clearInterval(this.refreshTimer); }

  load(silent = false) {
    if (!silent) this.loading = true;
    this.adminService.getAllOrders().subscribe({
      next: res => { this.orders = res.results || res; this.loading = false; },
      error: () => this.loading = false
    });
  }

  get filtered() {
    return this.filterPayment ? this.orders.filter(o => o.payment_status === this.filterPayment) : this.orders;
  }

  get totalPaid(): number { return this.orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + parseFloat(o.total_amount), 0); }
  get totalUnpaid(): number { return this.orders.filter(o => o.payment_status === 'unpaid' && o.status !== 'cancelled').reduce((s, o) => s + parseFloat(o.total_amount), 0); }
  get paidCount(): number { return this.orders.filter(o => o.payment_status === 'paid').length; }
  get unpaidCount(): number { return this.orders.filter(o => o.payment_status === 'unpaid' && o.status !== 'cancelled').length; }

  markPaid(id: number) {
    this.adminService.markOrderPaid(id, 'cash').subscribe({
      next: () => { this.toast.success(`Order #${id} marked as paid!`); this.load(); },
      error: () => this.toast.error('Failed.')
    });
  }

  statusClass(s: string): string {
    const m: any = { pending:'warning', confirmed:'info', preparing:'primary', ready:'success', served:'secondary', cancelled:'danger' };
    return `badge bg-${m[s] || 'secondary'}`;
  }
}

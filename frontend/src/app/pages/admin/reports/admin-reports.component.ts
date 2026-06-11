import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';

interface TopItem { name: string; category: string; count: number; revenue: number; }

@Component({ selector: 'app-admin-reports', templateUrl: './admin-reports.component.html', styleUrls: ['./admin-reports.component.scss'] })
export class AdminReportsComponent implements OnInit {
  // Daily report
  dailyReport: any = null;
  selectedDate = new Date().toISOString().split('T')[0];
  dailyLoading = false;

  // Overall stats
  orders: any[] = [];
  menuItems: any[] = [];
  overallLoading = false;

  // Tabs
  activeTab: 'daily' | 'overall' = 'daily';

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.loadDailyReport(); this.loadOverall(); }

  loadDailyReport() {
    this.dailyLoading = true;
    this.adminService.getDailyReport(this.selectedDate).subscribe({
      next: data => { this.dailyReport = data; this.dailyLoading = false; },
      error: () => this.dailyLoading = false
    });
  }

  onDateChange() { this.loadDailyReport(); }

  loadOverall() {
    this.overallLoading = true;
    this.adminService.getAllOrders().subscribe({
      next: res => { this.orders = res.results || res; this.overallLoading = false; }
    });
    this.adminService.getMenuItems().subscribe({ next: res => this.menuItems = res.results || res });
  }

  // ── Overall computed ──
  get totalRevenue(): number { return this.orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + parseFloat(o.total_amount), 0); }
  get avgOrderValue(): number { const p = this.orders.filter(o => o.payment_status === 'paid'); return p.length ? this.totalRevenue / p.length : 0; }
  get paidCount(): number { return this.orders.filter(o => o.payment_status === 'paid').length; }
  get unpaidCount(): number { return this.orders.filter(o => o.payment_status === 'unpaid' && o.status !== 'cancelled').length; }
  get cancelledCount(): number { return this.orders.filter(o => o.status === 'cancelled').length; }

  get topItems(): TopItem[] {
    const map: Record<string, TopItem> = {};
    this.orders.forEach(o => {
      (o.items || []).forEach((item: any) => {
        const name: string = item.menu_item_detail?.name || `Item #${item.menu_item}`;
        const cat: string = item.menu_item_detail?.category_name || '—';
        if (!map[name]) map[name] = { name, category: cat, count: 0, revenue: 0 };
        map[name].count += item.quantity;
        map[name].revenue += parseFloat(item.unit_price) * item.quantity;
      });
    });
    return (Object.values(map) as TopItem[]).sort((a, b) => b.count - a.count).slice(0, 10);
  }

  get ordersByStatus() {
    return ['pending','confirmed','preparing','ready','served','cancelled'].map(s => ({
      status: s,
      count: this.orders.filter(o => o.status === s).length
    }));
  }

  // ── Helpers ──
  get revenueChangeClass(): string {
    if (!this.dailyReport) return '';
    return this.dailyReport.revenue_change_pct >= 0 ? 'trend-up' : 'trend-dn';
  }

  get revenueChangeIcon(): string {
    if (!this.dailyReport) return '';
    return this.dailyReport.revenue_change_pct >= 0 ? '↑' : '↓';
  }

  formatDate(d: string): string {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
}

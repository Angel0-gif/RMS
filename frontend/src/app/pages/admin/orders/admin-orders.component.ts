import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';

@Component({ selector: 'app-admin-orders', templateUrl: './admin-orders.component.html', styleUrls: ['./admin-orders.component.scss'] })
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  menuItems: any[] = [];
  tables: any[] = [];
  selectedOrder: any = null;
  loading = false;
  showModal = false;
  submitting = false;
  filterStatus = '';
  filterPayment = '';
  form: FormGroup;

  statusOptions = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'];
  paymentMethods = ['cash', 'card', 'mobile_money'];

  constructor(private fb: FormBuilder, private adminService: AdminService, private toast: ToastService) {
    this.form = this.fb.group({
      table: [''],
      notes: [''],
      payment_method: ['cash'],
      items: this.fb.array([this.newItemRow()])
    });
  }

  ngOnInit() {
    this.load();
    this.loadMenuItems();
    this.loadTables();
  }

  get itemsArray(): FormArray { return this.form.get('items') as FormArray; }

  newItemRow(): FormGroup {
    return this.fb.group({
      menu_item: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
      special_request: ['']
    });
  }

  addItem() { this.itemsArray.push(this.newItemRow()); }
  removeItem(i: number) { if (this.itemsArray.length > 1) this.itemsArray.removeAt(i); }

  getItemName(id: number): string {
    const item = this.menuItems.find(m => m.id === +id);
    return item ? `${item.name} — ${item.price} XAF` : '';
  }

  load() {
    this.loading = true;
    const params: any = {};
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.filterPayment) params.payment_status = this.filterPayment;
    this.adminService.getAllOrders(params).subscribe({
      next: res => { this.orders = res.results || res; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadMenuItems() {
    this.adminService.getMenuItems({ available: 'true' }).subscribe({
      next: res => this.menuItems = res.results || res
    });
  }

  loadTables() {
    this.adminService.getTables().subscribe({
      next: res => this.tables = res.results || res
    });
  }

  openModal() {
    this.form.reset({ table: '', notes: '', payment_method: 'cash' });
    while (this.itemsArray.length > 1) this.itemsArray.removeAt(0);
    this.itemsArray.at(0).reset({ menu_item: '', quantity: 1, special_request: '' });
    this.showModal = true;
  }

  closeModal() { this.showModal = false; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const val = this.form.value;
    const payload: any = {
      notes: val.notes || '',
      items: val.items.map((i: any) => ({
        menu_item: +i.menu_item,
        quantity: +i.quantity,
        special_request: i.special_request || ''
      }))
    };
    if (val.table) payload.table = +val.table;
    this.adminService.createOrder(payload).subscribe({
      next: () => {
        this.toast.success('Order created successfully!');
        this.closeModal();
        this.load();
        this.submitting = false;
      },
      error: err => {
        const msg = err.error?.items?.[0] || err.error?.detail || Object.values(err.error || {}).flat().join(' ') || 'Failed to create order.';
        this.toast.error(msg);
        this.submitting = false;
      }
    });
  }

  updateStatus(id: number, status: string) {
    if (!status) return;
    this.adminService.updateOrderStatus(id, status).subscribe({
      next: updated => {
        this.orders = this.orders.map(o => o.id === id ? updated : o);
        if (this.selectedOrder?.id === id) this.selectedOrder = updated;
        this.toast.success(`Order #${id} → ${status}`);
      },
      error: err => this.toast.error(err.error?.error || 'Cannot update status.')
    });
  }

  markPaid(id: number, method = 'cash') {
    this.adminService.markOrderPaid(id, method).subscribe({
      next: updated => {
        this.orders = this.orders.map(o => o.id === id ? updated : o);
        if (this.selectedOrder?.id === id) this.selectedOrder = updated;
        this.toast.success(`Order #${id} marked as paid!`);
      },
      error: err => this.toast.error(err.error?.error || 'Failed.')
    });
  }

  deleteOrder(id: number) {
    if (!confirm(`Delete order #${id}? This cannot be undone.`)) return;
    this.adminService.deleteOrder(id).subscribe({
      next: () => { this.toast.success(`Order #${id} deleted.`); this.closeDetail(); this.load(); },
      error: () => this.toast.error('Cannot delete this order.')
    });
  }

  viewDetail(order: any) { this.selectedOrder = order; }
  closeDetail() { this.selectedOrder = null; }

  setFilter(type: string, val: string) {
    if (type === 'status') this.filterStatus = val;
    else this.filterPayment = val;
    this.load();
  }

  statusClass(s: string): string {
    const m: any = { pending: 'warning', confirmed: 'info', preparing: 'primary', ready: 'success', served: 'secondary', cancelled: 'danger' };
    return `badge bg-${m[s] || 'secondary'}`;
  }

  get totalRevenue(): number {
    return this.orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + parseFloat(o.total_amount), 0);
  }
}

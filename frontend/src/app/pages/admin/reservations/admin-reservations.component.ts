import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';

@Component({ selector: 'app-admin-reservations', templateUrl: './admin-reservations.component.html', styleUrls: ['./admin-reservations.component.scss'] })
export class AdminReservationsComponent implements OnInit {
  reservations: any[] = [];
  tables: any[] = [];
  loading = false;
  showModal = false;
  editingId: number | null = null;
  submitting = false;
  filterStatus = '';
  filterDate = '';
  form: FormGroup;
  today = new Date().toISOString().split('T')[0];

  statusOptions = ['pending', 'confirmed', 'cancelled', 'completed'];

  constructor(private fb: FormBuilder, private adminService: AdminService, private toast: ToastService) {
    this.form = this.fb.group({
      table: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      party_size: ['', [Validators.required, Validators.min(1), Validators.max(20)]],
      notes: [''],
      status: ['pending']
    });
  }

  ngOnInit() { this.load(); this.loadTables(); }

  load() {
    this.loading = true;
    const params: any = {};
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.filterDate) params.date = this.filterDate;
    this.adminService.getAllReservations(params).subscribe({
      next: res => { this.reservations = res.results || res; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadTables() {
    this.adminService.getTables().subscribe({ next: res => this.tables = res.results || res });
  }

  openModal(res?: any) {
    this.editingId = res?.id || null;
    this.form.reset({
      table: res?.table || '',
      date: res?.date || '',
      time: res?.time?.slice(0, 5) || '',
      party_size: res?.party_size || '',
      notes: res?.notes || '',
      status: res?.status || 'pending'
    });
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editingId = null; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const val = this.form.value;
    const action = this.editingId
      ? this.adminService.updateReservation(this.editingId, val)
      : this.adminService.createReservation(val);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingId ? 'Reservation updated!' : 'Reservation created!');
        this.closeModal(); this.load(); this.submitting = false;
      },
      error: err => {
        const errors = err.error;
        const msg = typeof errors === 'object'
          ? Object.values(errors).flat().join(' ')
          : 'Failed. Please check the details.';
        this.toast.error(msg);
        this.submitting = false;
      }
    });
  }

  updateStatus(id: number, status: string) {
    if (!status) return;
    this.adminService.updateReservation(id, { status }).subscribe({
      next: () => { this.toast.success(`Reservation #${id} → ${status}`); this.load(); },
      error: () => this.toast.error('Failed to update.')
    });
  }

  delete(id: number) {
    if (!confirm(`Delete reservation #${id}?`)) return;
    this.adminService.deleteReservation(id).subscribe({
      next: () => { this.toast.success('Reservation deleted.'); this.load(); },
      error: () => this.toast.error('Cannot delete this reservation.')
    });
  }

  applyFilters() { this.load(); }
  clearFilters() { this.filterStatus = ''; this.filterDate = ''; this.load(); }

  statusClass(s: string): string {
    const m: any = { pending: 'warning', confirmed: 'success', cancelled: 'danger', completed: 'secondary' };
    return `badge bg-${m[s] || 'secondary'}`;
  }

  getTableCapacity(tableId: number): number {
    return this.tables.find(t => t.id === +tableId)?.capacity || 0;
  }

  get f() { return this.form.controls; }
  get todayCount() { return this.reservations.filter(r => r.date === this.today).length; }
  get confirmedCount() { return this.reservations.filter(r => r.status === 'confirmed').length; }
  get pendingCount() { return this.reservations.filter(r => r.status === 'pending').length; }
}

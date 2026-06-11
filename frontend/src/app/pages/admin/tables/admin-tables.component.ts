import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
import { Table } from '../../../models/order.model';

@Component({ selector: 'app-admin-tables', templateUrl: './admin-tables.component.html', styleUrls: ['./admin-tables.component.scss'] })
export class AdminTablesComponent implements OnInit {
  tables: Table[] = [];
  loading = false;
  showModal = false;
  editingId: number | null = null;
  submitting = false;
  form: FormGroup;

  constructor(private fb: FormBuilder, private adminService: AdminService, private toast: ToastService) {
    this.form = this.fb.group({
      number: ['', [Validators.required, Validators.min(1)]],
      capacity: ['', [Validators.required, Validators.min(1), Validators.max(30)]],
      location: [''],
      is_occupied: [false]
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.adminService.getTables().subscribe({
      next: res => { this.tables = (res.results || res).sort((a: Table, b: Table) => a.number - b.number); this.loading = false; },
      error: () => this.loading = false
    });
  }

  openModal(t?: Table) {
    this.editingId = t?.id || null;
    this.form.reset({ number: t?.number || '', capacity: t?.capacity || '', location: t?.location || '', is_occupied: t?.is_occupied ?? false });
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editingId = null; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const action = this.editingId
      ? this.adminService.updateTable(this.editingId, this.form.value)
      : this.adminService.createTable(this.form.value);
    action.subscribe({
      next: () => { this.toast.success(this.editingId ? 'Table updated!' : 'Table added!'); this.closeModal(); this.load(); this.submitting = false; },
      error: err => { this.toast.error(Object.values(err.error || {}).flat().join(' ') || 'Failed.'); this.submitting = false; }
    });
  }

  toggleOccupied(t: Table) {
    this.adminService.updateTable(t.id, { is_occupied: !t.is_occupied } as any).subscribe({
      next: () => { this.toast.info(`Table ${t.number} marked as ${t.is_occupied ? 'free' : 'occupied'}.`); this.load(); },
      error: () => this.toast.error('Failed to update table.')
    });
  }

  delete(id: number, num: number) {
    if (!confirm(`Delete Table ${num}?`)) return;
    this.adminService.deleteTable(id).subscribe({
      next: () => { this.toast.success('Table deleted.'); this.load(); },
      error: () => this.toast.error('Cannot delete this table.')
    });
  }

  get f() { return this.form.controls; }
  get freeCount() { return this.tables.filter(t => !t.is_occupied).length; }
  get occupiedCount() { return this.tables.filter(t => t.is_occupied).length; }
}

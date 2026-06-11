import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Reservation, Table } from '../../models/order.model';
import { User } from '../../models/user.model';

@Component({ selector: 'app-reservations', templateUrl: './reservations.component.html', styleUrls: ['./reservations.component.scss'] })
export class ReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  tables: Table[] = [];
  user: User | null = null;
  loading = false;
  showForm = false;
  editingId: number | null = null;
  submitting = false;
  form: FormGroup;
  today = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {
    this.form = this.fb.group({
      table: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      party_size: ['', [Validators.required, Validators.min(1), Validators.max(20)]],
      notes: ['']
    });
  }

  ngOnInit() {
    this.user = this.authService.currentUser;
    this.loadReservations();
    this.loadTables();
  }

  loadReservations() {
    this.loading = true;
    this.orderService.getReservations().subscribe({
      next: res => { this.reservations = res.results || res; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadTables() {
    this.orderService.getTables().subscribe({ next: res => this.tables = res.results || res });
  }

  openForm(reservation?: Reservation) {
    if (reservation) {
      this.editingId = reservation.id;
      this.form.patchValue(reservation);
    } else {
      this.editingId = null;
      this.form.reset();
    }
    this.showForm = true;
  }

  closeForm() { this.showForm = false; this.form.reset(); this.editingId = null; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const action = this.editingId
      ? this.orderService.updateReservation(this.editingId, this.form.value)
      : this.orderService.createReservation(this.form.value);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingId ? 'Reservation updated!' : 'Reservation created!');
        this.closeForm();
        this.loadReservations();
        this.submitting = false;
      },
      error: err => {
        this.submitting = false;
        const errs = err.error;
        if (typeof errs === 'object') {
          const msg = Object.values(errs).flat().join(' ');
          this.toast.error(msg);
        } else { this.toast.error('Failed. Please try again.'); }
      }
    });
  }

  cancel(id: number) {
    if (!confirm('Cancel this reservation?')) return;
    this.orderService.updateReservation(id, { status: 'cancelled' }).subscribe({
      next: () => { this.toast.success('Reservation cancelled.'); this.loadReservations(); },
      error: () => this.toast.error('Failed to cancel.')
    });
  }

  delete(id: number) {
    if (!confirm('Delete this reservation permanently?')) return;
    this.orderService.deleteReservation(id).subscribe({
      next: () => { this.toast.success('Reservation deleted.'); this.loadReservations(); },
      error: () => this.toast.error('Failed to delete.')
    });
  }

  getStatusClass(s: string) {
    const m: any = { pending: 'warning', confirmed: 'success', cancelled: 'danger', completed: 'secondary' };
    return `badge bg-${m[s] || 'secondary'}`;
  }

  get selectedTableCapacity(): number {
    const tid = this.form.get('table')?.value;
    return this.tables.find(t => t.id == tid)?.capacity || 0;
  }

  logout() {
    this.authService.logout().subscribe({ next: () => this.router.navigate(['/']), error: () => { this.authService.clearAuth(); this.router.navigate(['/']); } });
  }
}

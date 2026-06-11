import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
import { MenuItem } from '../../../models/menu.model';
import { Category } from '../../../models/menu.model';

@Component({ selector: 'app-admin-menu-items', templateUrl: './admin-menu-items.component.html', styleUrls: ['./admin-menu-items.component.scss'] })
export class AdminMenuItemsComponent implements OnInit {
  items: MenuItem[] = [];
  categories: Category[] = [];
  loading = false;
  showModal = false;
  editingId: number | null = null;
  submitting = false;
  activeCatFilter = 0;
  form: FormGroup;

  constructor(private fb: FormBuilder, private adminService: AdminService, private toast: ToastService) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      preparation_time: [15, [Validators.required, Validators.min(1)]],
      calories: [''],
      allergens: [''],
      is_available: [true],
      is_featured: [false],
    });
  }

  ngOnInit() { this.loadCategories(); this.loadItems(); }

  loadCategories() { this.adminService.getCategories().subscribe({ next: res => this.categories = res.results || res }); }

  loadItems() {
    this.loading = true;
    const params = this.activeCatFilter ? { category: this.activeCatFilter } : {};
    this.adminService.getMenuItems(params).subscribe({
      next: res => { this.items = res.results || res; this.loading = false; },
      error: () => this.loading = false
    });
  }

  filterByCat(id: number) { this.activeCatFilter = id; this.loadItems(); }

  openModal(item?: MenuItem) {
    this.editingId = item?.id || null;
    this.form.reset({
      name: item?.name || '', category: item?.category || '', description: item?.description || '',
      price: item?.price || '', preparation_time: item?.preparation_time || 15,
      calories: item?.calories || '', allergens: item?.allergens || '',
      is_available: item?.is_available ?? true, is_featured: item?.is_featured ?? false,
    });
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editingId = null; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const action = this.editingId
      ? this.adminService.updateMenuItem(this.editingId, this.form.value)
      : this.adminService.createMenuItem(this.form.value);
    action.subscribe({
      next: () => { this.toast.success(this.editingId ? 'Item updated!' : 'Item created!'); this.closeModal(); this.loadItems(); this.submitting = false; },
      error: err => { this.toast.error(Object.values(err.error || {}).flat().join(' ') || 'Failed.'); this.submitting = false; }
    });
  }

  delete(id: number, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    this.adminService.deleteMenuItem(id).subscribe({
      next: () => { this.toast.success('Item deleted.'); this.loadItems(); },
      error: () => this.toast.error('Cannot delete this item.')
    });
  }

  getCatName(id: number): string { return this.categories.find(c => c.id === id)?.name || '—'; }
  get f() { return this.form.controls; }
}

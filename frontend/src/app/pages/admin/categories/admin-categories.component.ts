import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
import { Category } from '../../../models/menu.model';

@Component({ selector: 'app-admin-categories', templateUrl: './admin-categories.component.html', styleUrls: ['./admin-categories.component.scss'] })
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = false;
  showModal = false;
  editingId: number | null = null;
  submitting = false;
  form: FormGroup;

  constructor(private fb: FormBuilder, private adminService: AdminService, private toast: ToastService) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      icon: [''],
      is_active: [true]
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.adminService.getCategories().subscribe({
      next: res => { this.categories = res.results || res; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openModal(cat?: Category) {
    this.editingId = cat?.id || null;
    this.form.reset({ name: cat?.name || '', description: cat?.description || '', icon: cat?.icon || '', is_active: cat?.is_active ?? true });
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editingId = null; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const action = this.editingId
      ? this.adminService.updateCategory(this.editingId, this.form.value)
      : this.adminService.createCategory(this.form.value);
    action.subscribe({
      next: () => { this.toast.success(this.editingId ? 'Category updated!' : 'Category created!'); this.closeModal(); this.load(); this.submitting = false; },
      error: err => { this.toast.error(Object.values(err.error || {}).flat().join(' ') || 'Failed.'); this.submitting = false; }
    });
  }

  delete(id: number, name: string) {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    this.adminService.deleteCategory(id).subscribe({
      next: () => { this.toast.success('Category deleted.'); this.load(); },
      error: err => this.toast.error(err.error?.detail || 'Cannot delete — may have menu items.')
    });
  }

  get f() { return this.form.controls; }
}

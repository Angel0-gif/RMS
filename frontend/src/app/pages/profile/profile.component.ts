import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { User } from '../../models/user.model';

@Component({ selector: 'app-profile', templateUrl: './profile.component.html', styleUrls: ['./profile.component.scss'] })
export class ProfileComponent implements OnInit {
  /** True when rendered inside the admin layout (/admin/profile) — hides the customer sidebar. */
  get adminContext(): boolean { return this.router.url.startsWith('/admin'); }

  user: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  pwdLoading = false;
  activeTab = 'info';
  avatarPreview: string | null = null;
  selectedFile: File | null = null;
  successMsg = '';
  errorMsg = '';
  pwdSuccess = '';
  pwdError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      phone: [''],
      bio: [''],
      address: [''],
      date_of_birth: ['']
    });

    this.passwordForm = this.fb.group({
      old_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      new_password2: ['', Validators.required]
    }, { validators: this.pwdMatch });
  }

  pwdMatch(g: AbstractControl) {
    return g.get('new_password')?.value === g.get('new_password2')?.value ? null : { mismatch: true };
  }

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: user => {
        this.user = user;
        this.profileForm.patchValue(user);
      }
    });
  }

  get pf() { return this.profileForm.controls; }
  get pwf() { return this.passwordForm.controls; }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.toast.error('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { this.toast.error('Image must be under 5MB.'); return; }
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = e => this.avatarPreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  saveProfile() {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';

    if (this.selectedFile) {
      const fd = new FormData();
      Object.keys(this.profileForm.value).forEach(k => {
        const v = this.profileForm.value[k];
        if (v !== null && v !== undefined && v !== '') fd.append(k, v);
      });
      fd.append('avatar', this.selectedFile);
      this.authService.updateProfile(fd).subscribe({
        next: () => { this.loading = false; this.successMsg = 'Profile updated successfully!'; this.toast.success('Profile updated!'); },
        error: err => { this.loading = false; this.errorMsg = Object.values(err.error || {}).flat().join(' ') || 'Update failed.'; }
      });
    } else {
      this.authService.updateProfile(this.profileForm.value).subscribe({
        next: () => { this.loading = false; this.successMsg = 'Profile updated successfully!'; this.toast.success('Profile updated!'); },
        error: err => { this.loading = false; this.errorMsg = Object.values(err.error || {}).flat().join(' ') || 'Update failed.'; }
      });
    }
  }

  changePassword() {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.pwdLoading = true;
    this.pwdSuccess = '';
    this.pwdError = '';
    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.pwdLoading = false;
        this.pwdSuccess = 'Password changed successfully! Please log in again.';
        this.toast.success('Password changed!');
        this.passwordForm.reset();
        setTimeout(() => { this.authService.clearAuth(); this.router.navigate(['/login']); }, 2000);
      },
      error: err => {
        this.pwdLoading = false;
        this.pwdError = err.error?.old_password?.[0] || err.error?.new_password?.[0] || Object.values(err.error||{}).flat().join(' ') || 'Failed.';
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({ next: () => this.router.navigate(['/']), error: () => { this.authService.clearAuth(); this.router.navigate(['/']); } });
  }

  getInitials(): string {
    return `${this.user?.first_name?.[0] || ''}${this.user?.last_name?.[0] || ''}`;
  }
}

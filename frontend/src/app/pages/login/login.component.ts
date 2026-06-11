import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.form.controls; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMsg = '';

    this.authService.login(this.form.value).subscribe({
      next: (res) => {
        this.loading = false;
        const role = res.user?.role;
        this.toast.success(`Welcome back, ${res.user?.first_name}!`);

        // Admin/Manager → admin panel
        // Customer/anyone else → customer dashboard
        if (role === 'manager' || role === 'staff') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: err => {
        this.loading = false;
        this.errorMsg =
          err.error?.detail ||
          err.error?.non_field_errors?.[0] ||
          'Invalid email or password. Please try again.';
      }
    });
  }
}

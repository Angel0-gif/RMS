import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';

  perks = [
    { icon: '🍽️', title: 'Browse Full Menu', desc: 'Access our complete menu with all specialties' },
    { icon: '📱', title: 'Online Orders', desc: 'Place orders directly from your phone or computer' },
    { icon: '📅', title: 'Table Reservations', desc: 'Reserve your table in advance with ease' },
    { icon: '📊', title: 'Order History', desc: 'Track all your past orders and spending' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    // No 'role' field — backend always assigns 'customer'
    this.form = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', Validators.required]
    }, { validators: this.passwordMatch });
  }

  passwordMatch(g: AbstractControl) {
    return g.get('password')?.value === g.get('password2')?.value ? null : { mismatch: true };
  }

  get f() { return this.form.controls; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMsg = '';

    this.authService.register(this.form.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.success(`Welcome to La Bella Cucina, ${res.user?.first_name}!`);
        // New registrations are always customers
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.loading = false;
        const errs = err.error;
        if (typeof errs === 'object') {
          this.errorMsg = Object.values(errs).flat().join(' ');
        } else {
          this.errorMsg = 'Registration failed. Please try again.';
        }
      }
    });
  }
}

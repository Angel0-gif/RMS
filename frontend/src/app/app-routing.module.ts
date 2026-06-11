import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { GuestGuard } from './guards/guest.guard';

const routes: Routes = [
  // Public
  { path: '', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) },
  { path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule), canActivate: [GuestGuard] },
  { path: 'register', loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterModule), canActivate: [GuestGuard] },

  // Admin (manager/staff only)
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, AdminGuard]
  },

  // Customer
  { path: 'dashboard', loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
  { path: 'menu', loadChildren: () => import('./pages/menu/menu.module').then(m => m.MenuModule), canActivate: [AuthGuard] },
  { path: 'orders', loadChildren: () => import('./pages/orders/orders.module').then(m => m.OrdersModule), canActivate: [AuthGuard] },
  { path: 'reservations', loadChildren: () => import('./pages/reservations/reservations.module').then(m => m.ReservationsModule), canActivate: [AuthGuard] },
  { path: 'profile', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule), canActivate: [AuthGuard] },

  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

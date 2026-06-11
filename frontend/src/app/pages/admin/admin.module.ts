import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { CountByStatusPipe } from '../../pipes/count-by-status.pipe';

import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { AdminCategoriesComponent } from './categories/admin-categories.component';
import { AdminMenuItemsComponent } from './menu-items/admin-menu-items.component';
import { AdminTablesComponent } from './tables/admin-tables.component';
import { AdminOrdersComponent } from './orders/admin-orders.component';
import { AdminReservationsComponent } from './reservations/admin-reservations.component';
import { AdminBillingComponent } from './billing/admin-billing.component';
import { AdminReportsComponent } from './reports/admin-reports.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'categories', component: AdminCategoriesComponent },
      { path: 'menu-items', component: AdminMenuItemsComponent },
      { path: 'tables', component: AdminTablesComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'reservations', component: AdminReservationsComponent },
      { path: 'billing', component: AdminBillingComponent },
      { path: 'reports', component: AdminReportsComponent },
    ]
  }
];

@NgModule({
  declarations: [
    AdminLayoutComponent,
    PageHeaderComponent,
    StatCardComponent,
    CountByStatusPipe,
    AdminDashboardComponent,
    AdminCategoriesComponent,
    AdminMenuItemsComponent,
    AdminTablesComponent,
    AdminOrdersComponent,
    AdminReservationsComponent,
    AdminBillingComponent,
    AdminReportsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule {}

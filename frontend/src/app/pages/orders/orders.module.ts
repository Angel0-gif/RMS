import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { OrdersComponent } from './orders.component';

const routes: Routes = [{ path: '', component: OrdersComponent }];
@NgModule({ declarations: [OrdersComponent], imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes)] })
export class OrdersModule {}

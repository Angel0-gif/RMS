import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ReservationsComponent } from './reservations.component';

const routes: Routes = [{ path: '', component: ReservationsComponent }];
@NgModule({ declarations: [ReservationsComponent], imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes)] })
export class ReservationsModule {}

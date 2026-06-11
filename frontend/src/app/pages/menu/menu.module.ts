import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MenuComponent } from './menu.component';

const routes: Routes = [{ path: '', component: MenuComponent }];
@NgModule({ declarations: [MenuComponent], imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes)] })
export class MenuModule {}

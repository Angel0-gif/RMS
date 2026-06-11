import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';

const routes: Routes = [{ path: '', component: ProfileComponent }];
@NgModule({ declarations: [ProfileComponent], imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes)] })
export class ProfileModule {}

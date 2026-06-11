import { Component, OnInit } from '@angular/core';
import { ToastService, Toast } from './services/toast.service';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <!-- GLOBAL TOAST -->
    <div class="toast-container" *ngIf="toast">
      <div class="toast-msg" [class]="toast.type">
        <span *ngIf="toast.type === 'success'"><i class="bi bi-check-circle-fill"></i></span>
        <span *ngIf="toast.type === 'error'"><i class="bi bi-x-circle-fill"></i></span>
        <span *ngIf="toast.type === 'info'"><i class="bi bi-info-circle-fill"></i></span>
        <span *ngIf="toast.type === 'warning'"><i class="bi bi-exclamation-triangle-fill"></i></span>
        {{toast.message}}
      </div>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  toast: Toast | null = null;
  title = 'Restaurant MS';

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toast$.subscribe(t => this.toast = t);
  }
}

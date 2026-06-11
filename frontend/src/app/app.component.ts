import { Component, OnInit } from '@angular/core';
import { ToastService, Toast } from './services/toast.service';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <!-- GLOBAL TOAST -->
    <div class="toast-container" *ngIf="toast">
      <div class="toast-msg" [class]="toast.type">
        <span *ngIf="toast.type === 'success'">✅</span>
        <span *ngIf="toast.type === 'error'">❌</span>
        <span *ngIf="toast.type === 'info'">ℹ️</span>
        <span *ngIf="toast.type === 'warning'">⚠️</span>
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

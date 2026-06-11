import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast { message: string; type: 'success'|'error'|'info'|'warning'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new BehaviorSubject<Toast | null>(null);
  toast$ = this.toastSubject.asObservable();

  show(message: string, type: Toast['type'] = 'info') {
    this.toastSubject.next({ message, type });
    setTimeout(() => this.toastSubject.next(null), 4000);
  }
  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string) { this.show(msg, 'error'); }
  info(msg: string) { this.show(msg, 'info'); }
}

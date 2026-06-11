import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ title }}</h1>
        <p class="page-sub" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="page-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@400&display=swap');
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.8rem; flex-wrap:wrap; gap:1rem; padding:2rem 2rem 0; }
    .page-title { font-family:'Playfair Display',serif; font-size:1.65rem; color:#1a1a2e; margin:0; }
    .page-sub { color:#888; margin:.2rem 0 0; font-size:.9rem; font-family:'Lato',sans-serif; }
    .page-actions { display:flex; gap:.6rem; align-items:center; flex-wrap:wrap; }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}

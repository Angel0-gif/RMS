import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  template: `
    <div class="stat-card" [style.border-left-color]="color">
      <div class="stat-icon">{{ icon }}</div>
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&family=Lato:wght@400&display=swap');
    .stat-card { background:#fff; border-radius:14px; padding:1.3rem; border-left:4px solid #ccc; box-shadow:0 2px 10px rgba(0,0,0,.05); }
    .stat-icon { font-size:1.4rem; margin-bottom:.3rem; }
    .stat-value { font-family:'Playfair Display',serif; font-size:1.8rem; font-weight:900; color:#1a1a2e; line-height:1; }
    .stat-label { color:#888; font-size:.8rem; margin-top:.2rem; font-family:'Lato',sans-serif; }
  `]
})
export class StatCardComponent {
  @Input() icon = '';
  @Input() value: any = 0;
  @Input() label = '';
  @Input() color = '#c9a84c';
}

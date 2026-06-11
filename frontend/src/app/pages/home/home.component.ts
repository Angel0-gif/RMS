import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { AuthService } from '../../services/auth.service';
import { MenuItem } from '../../models/menu.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredItems: MenuItem[] = [];
  loading = false;
  isLoggedIn = false;

  // Features mapping to standard Bootstrap Icons (bi-*)
  features = [
    { icon: 'bi bi-egg-fried', title: 'Master Chefs', desc: 'Our expert chefs craft every dish with passion and precision.' },
    { icon: 'bi bi-flower1', title: 'Fresh Ingredients', desc: 'Locally sourced, daily fresh ingredients for the best flavors.' },
    { icon: 'bi bi-phone', title: 'Easy Online Orders', desc: 'Order ahead, reserve tables, track your meals in real time.' },
    { icon: 'bi bi-award', title: 'Premium Service', desc: 'White-glove service that makes every visit special.' },
  ];

  // Steps matching the "How It Works" 1, 2, 3 loop
  steps = [
    { icon: 'bi bi-person-plus', title: 'Create Account', desc: 'Sign up for free in under 2 minutes and start exploring our menu.' },
    { icon: 'bi bi-journal-text', title: 'Browse & Order', desc: 'Choose from our wide selection of dishes and customize your order.' },
    { icon: 'bi bi-lightning-charge', title: 'Enjoy!', desc: 'Your order is prepared with care and served fresh to your table.' },
  ];

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Stay in sync with auth state (updates instantly on login/logout)
    this.authService.currentUser$.subscribe(() => {
      this.isLoggedIn = this.authService.isLoggedIn;
    });
    this.loadFeatured();
  }

  loadFeatured(): void {
    this.loading = true;
    this.menuService.getFeaturedItems().subscribe({
      next: (items) => { 
        // Handles both direct arrays and paginated DRF responses ({ results: [...] })
        const completeList = Array.isArray(items) ? items : (items as any)?.results || [];
        this.featuredItems = completeList.slice(0, 6); 
        this.loading = false; 
      },
      error: (err) => {
        console.error('Failed to load featured catalog items', err);
        this.loading = false; 
      }
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { OrderService } from '../../services/order.service';
import { CartService, CartItem } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { Category, MenuItem } from '../../models/menu.model';
import { Table } from '../../models/order.model';
import { User } from '../../models/user.model';

@Component({ selector: 'app-menu', templateUrl: './menu.component.html', styleUrls: ['./menu.component.scss'] })
export class MenuComponent implements OnInit {
  categories: Category[] = [];
  items: MenuItem[] = [];
  tables: Table[] = [];
  cartItems: CartItem[] = [];
  user: User | null = null;

  selectedCategory = 0;
  searchQuery = '';
  loading = false;
  showCart = false;
  submitting = false;
  selectedTable = 0;
  orderNotes = '';

  constructor(
    private menuService: MenuService,
    private orderService: OrderService,
    public cartService: CartService,
    private toast: ToastService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUser;
    this.cartService.cart$.subscribe(c => this.cartItems = c);
    this.loadCategories();
    this.loadItems();
    this.loadTables();
  }

  loadCategories() {
    this.menuService.getCategories().subscribe({ next: r => this.categories = r.results || r });
  }

  loadItems(categoryId = 0) {
    this.loading = true;
    const params: any = { available: 'true' };
    if (categoryId) params.category = categoryId;
    if (this.searchQuery) params.search = this.searchQuery;
    this.menuService.getMenuItems(params).subscribe({
      next: r => { this.items = r.results || r; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadTables() {
    this.orderService.getTables().subscribe({ next: r => this.tables = (r.results || r).filter((t: Table) => !t.is_occupied) });
  }

  filterByCategory(id: number) {
    this.selectedCategory = id;
    this.loadItems(id);
  }

  search() { this.loadItems(this.selectedCategory); }

  addToCart(item: MenuItem) {
    this.cartService.addItem(item);
    this.toast.success(`${item.name} added to cart!`);
  }

  isInCart(itemId: number): boolean {
    return this.cartItems.some(c => c.item.id === itemId);
  }

  getQty(itemId: number): number {
    return this.cartItems.find(c => c.item.id === itemId)?.quantity || 0;
  }

  placeOrder() {
    if (this.cartItems.length === 0) { this.toast.error('Cart is empty!'); return; }
    this.submitting = true;
    const orderData: any = {
      items: this.cartItems.map(c => ({ menu_item: c.item.id, quantity: c.quantity, special_request: c.special_request })),
      notes: this.orderNotes,
    };
    if (this.selectedTable) orderData.table = this.selectedTable;
    this.orderService.createOrder(orderData).subscribe({
      next: () => {
        this.toast.success('Order placed successfully!');
        this.cartService.clear();
        this.showCart = false;
        this.submitting = false;
        this.router.navigate(['/orders']);
      },
      error: err => {
        this.submitting = false;
        const msg = err.error?.items?.[0] || err.error?.detail || 'Failed to place order.';
        this.toast.error(msg);
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({ next: () => this.router.navigate(['/']), error: () => { this.authService.clearAuth(); this.router.navigate(['/']); } });
  }
}

# 🍽️ La Bella Cucina — Restaurant Management System

A full-stack restaurant management web application built with **Django REST Framework** (backend) and **Angular 17** (frontend).

**Institution:** Institut Universitaire Saint Jean | **Instructor:** Mr. KINKEU Daniel | **Year:** 2025/2026

---

## ✨ Features

### 🔴 Admin Panel (`/admin`) — Manager / Staff only
| Section | Features |
|---------|---------|
| 🗂️ **Categories** | Create, edit, delete menu categories with emoji icons |
| 🍽️ **Menu Items** | Full CRUD — add dishes with price, prep time, calories, allergens, featured status |
| 🪑 **Tables** | Add/edit tables, toggle occupied/free status |
| 🛒 **Orders** | View ALL customer orders, update status flow, mark as paid |
| 📅 **Reservations** | View all reservations, update status |
| 💰 **Billing** | Invoice view, paid/unpaid totals, mark payments |
| 📈 **Reports** | Revenue analytics, top-selling items, order stats |

### 🟢 Customer Panel (`/dashboard`) — Customers
- Browse menu by category, search dishes, add to cart
- Place orders with table selection and special instructions
- Track orders with real-time status updates
- Make and manage table reservations
- View and edit personal profile, change password, upload avatar

### 🏠 Public Homepage
- Landing page visible before login with featured menu preview
- Register and login pages with JWT authentication

---

## 🚀 Quick Start

### Backend (Django REST Framework)
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Backend runs at: **http://localhost:8000**

### Frontend (Angular 17)
```bash
cd frontend
npm install
ng serve
```
Frontend runs at: **http://localhost:4200**

---

## 🔑 Demo Credentials

| Role | Email | Password | Redirects to |
|------|-------|----------|-------------|
| **Manager/Admin** | admin@restaurant.com | Admin@123 | `/admin/dashboard` |
| **Customer** | demo@restaurant.com | Demo@123 | `/dashboard` |

Django Admin Panel: **http://localhost:8000/admin**

---

## 🏗️ Project Structure

```
restaurant-ms/
├── backend/
│   ├── config/              # Django settings, urls, wsgi
│   ├── accounts/            # Custom User model, JWT auth, profile API
│   ├── menu/                # Category & MenuItem models + API
│   ├── orders/              # Order, Table, Reservation models + API
│   ├── requirements.txt
│   └── manage.py
│
└── frontend/
    └── src/app/
        ├── models/          # TypeScript interfaces (User, MenuItem, Order...)
        ├── services/        # AuthService, MenuService, OrderService, AdminService, CartService, ToastService
        ├── guards/          # AuthGuard, AdminGuard, GuestGuard
        ├── interceptors/    # JWT AuthInterceptor (auto-attach token + refresh on 401)
        ├── pipes/           # CountByStatusPipe
        ├── components/
        │   ├── admin-layout/   # Admin sidebar + layout (matching your design)
        │   ├── page-header/    # Reusable page header
        │   └── stat-card/      # Reusable stat card
        └── pages/
            ├── home/           # Public landing page
            ├── login/          # Login (redirects admin→/admin, customer→/dashboard)
            ├── register/       # Registration with Reactive Forms
            ├── admin/          # 🔴 ADMIN MODULE (lazy-loaded)
            │   ├── dashboard/      # Stats overview
            │   ├── categories/     # Category CRUD
            │   ├── menu-items/     # Menu item CRUD
            │   ├── tables/         # Table management
            │   ├── orders/         # All orders management
            │   ├── reservations/   # All reservations
            │   ├── billing/        # Payment tracking
            │   └── reports/        # Analytics
            ├── dashboard/      # Customer dashboard
            ├── menu/           # Menu browser + cart
            ├── orders/         # Customer's orders
            ├── reservations/   # Customer's reservations
            └── profile/        # Edit profile + change password
```

---

## 🌐 API Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/auth/login/` | POST | Public | JWT login |
| `/api/auth/register/` | POST | Public | Register new user |
| `/api/auth/profile/` | GET/PATCH | Auth | View/edit own profile |
| `/api/auth/change-password/` | POST | Auth | Change password |
| `/api/menu/categories/` | GET | Public | List categories |
| `/api/menu/categories/` | POST/PATCH/DELETE | Manager | Manage categories |
| `/api/menu/items/` | GET | Public | List menu items |
| `/api/menu/items/` | POST/PATCH/DELETE | Manager | Manage menu items |
| `/api/orders/tables/` | GET | Public | List tables |
| `/api/orders/tables/` | POST/PATCH/DELETE | Manager | Manage tables |
| `/api/orders/orders/` | GET | Auth | Own orders (customers) / ALL orders (managers) |
| `/api/orders/orders/` | POST | Auth | Place new order |
| `/api/orders/orders/{id}/update_status/` | PATCH | Auth | Update order status |
| `/api/orders/orders/{id}/pay/` | PATCH | Auth | Record payment |
| `/api/orders/orders/summary/` | GET | Auth | Order statistics |
| `/api/orders/reservations/` | GET | Auth | Own reservations (customers) / ALL (managers) |

---

## ☁️ Deployment

### Backend → Render
1. Connect GitHub repo to [render.com](https://render.com)
2. Build: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
3. Start: `gunicorn config.wsgi`
4. Set env vars: `SECRET_KEY`, `DEBUG=False`, `DATABASE_URL`

### Frontend → Vercel
1. Import repo to [vercel.com](https://vercel.com)
2. Build command: `ng build --configuration=production`
3. Output dir: `dist/frontend/browser`
4. Update `environment.production.ts` with your Render API URL

---

## ✅ Project Grading Checklist

- ✅ Django REST Framework with serializers and ViewSets
- ✅ JWT authentication (djangorestframework-simplejwt) — sessions NOT used
- ✅ Data scoped by user in `get_queryset()` — customers see own data, managers see all
- ✅ Business logic validation in DRF serializers (price > 0, availability, party size, conflicts)
- ✅ Django Admin registered and functional for all entities
- ✅ CORS configured (django-cors-headers)
- ✅ requirements.txt present
- ✅ Angular 17 SPA with lazy-loaded routing
- ✅ **AdminGuard** — only managers/staff access `/admin` routes
- ✅ **AuthGuard + GuestGuard** on all private/public routes
- ✅ **JWT HTTP Interceptor** — auto-attaches Bearer token on every request
- ✅ **Token refresh** on 401 responses
- ✅ Dedicated Angular services per entity (AuthService, MenuService, OrderService, AdminService)
- ✅ Reactive Forms with client-side validation + server error display
- ✅ Loading spinners on all API calls
- ✅ Toast notifications for all actions
- ✅ Admin panel: Categories CRUD, Menu Items CRUD, Tables management
- ✅ Admin panel: All orders with status workflow, billing, analytics reports
- ✅ Public homepage before authentication
- ✅ Profile view + edit + avatar upload + password change
- ✅ **BONUS**: Customized Django Admin (themed headers, list_display, list_filter, search_fields, inlines)

---

*Built with ❤️ for Institut Universitaire Saint Jean — 2025/2026*

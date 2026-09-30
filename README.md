# 🍛 Foodle — Production Food Delivery Platform

> A full-stack food delivery platform with separate role dashboards (Customer, Restaurant, Rider, Admin), real-time live order tracking, 4-digit delivery OTP verification, and double-entry financial ledger accounting.

---

## 🚀 Demo Accounts & Instant Login

A **1-Click Demo Switcher** is pinned to the top of the interface for immediate testing across all 4 roles:

| Role | Demo Email | Password | Default Portal |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@foodle.app` | `Admin@123` | [`/admin`](http://localhost:5173/admin) |
| **Restaurant Partner** | `partner@delhidarbar.com` | `Demo@123` | [`/restaurant`](http://localhost:5173/restaurant) |
| **Delivery Rider** | `rider@foodle.app` | `Demo@123` | [`/rider`](http://localhost:5173/rider) |
| **Customer** | `customer@foodle.app` | `Demo@123` | [`/app`](http://localhost:5173/app) |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS (warm food palette), Lucide Icons, Leaflet & OpenStreetMap, Socket.io-client, React Hot Toast.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, Socket.io, Zod validation, Helmet, CORS, Cookie-Parser, Bcrypt, Jsonwebtoken, Nodemailer.
- **Database**: PostgreSQL (Neon / Supabase free tier) + SQLite fallback for instant zero-config local development.
- **Security**: HttpOnly SameSite secure cookies, bcrypt password hashing, 4-digit hashed delivery OTP, server-verified Razorpay payments, Zod request payload sanitization.

---

## 📁 Monorepo Structure

```
foodle/
├── package.json              # Monorepo scripts (dev, build, seed, test)
├── SECURITY.md               # Security rotation & deployment checklist
├── .env.example              # Unified environment variable template
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma     # Active Prisma schema (SQLite dev / PostgreSQL prod)
│   │   ├── schema.postgresql.prisma # PostgreSQL schema for Neon / Supabase
│   │   └── seed.ts           # Demo users, restaurants, menus & coupons
│   └── src/
│       ├── config/           # Database & environment configurations
│       ├── controllers/      # auth, user, order, restaurant, rider, admin
│       ├── middleware/       # authenticate, requireRole, validateBody, error, rateLimit
│       ├── routes/           # REST API endpoints (/api/auth, /api/users, etc.)
│       ├── services/         # auth.service, email.service
│       ├── utils/            # logger, otp, responseHandler
│       ├── validators/       # Zod schemas
│       ├── tests/            # Vitest unit & integration test suites
│       └── server.ts         # Express & Socket.io server entrypoint
│
└── client/
    ├── src/
    │   ├── api/              # Axios instance with interceptors
    │   ├── components/       # DemoSwitcher, ProtectedRoute, UI components
    │   ├── context/          # AuthContext (user session, 1-click switch, OTP)
    │   ├── layouts/          # CustomerLayout, RestaurantLayout, RiderLayout, AdminLayout
    │   ├── pages/            # Role-segregated views (/app, /restaurant, /rider, /admin, /login)
    │   ├── types/            # TypeScript interfaces
    │   ├── App.tsx           # Route definitions & Role guards
    │   └── main.tsx          # Application entrypoint
    ├── tailwind.config.js    # Customized food-inspired color palette
    └── vite.config.ts        # Vite configuration & proxy
```

---

## ⚡ Quickstart Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Database & Seed Demo Data
```bash
npm run seed
```

### 3. Run Tests
```bash
npm test
```

### 4. Start Development Servers
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001/api](http://localhost:5001/api)
- **Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 🗺️ Phases Roadmap

- [x] **Phase 1**: Monorepo setup, complete multi-role DB schema, JWT auth with httpOnly cookies, 6-digit email OTP verification, role route guards, warm custom design system, and 1-click demo switcher.
- [ ] **Phase 2**: Restaurants catalog, menus, categories, dish search, veg/non-veg filters, single-restaurant cart logic.
- [ ] **Phase 3**: Checkout, Razorpay test payment integration, COD, and order creation.
- [ ] **Phase 4**: Restaurant operational dashboard and live order state machine transitions.
- [ ] **Phase 5**: Rider proximity assignment (Haversine formula), 30s offer timer, live GPS Leaflet map tracking, and 4-digit Delivery OTP.
- [ ] **Phase 6**: Financial ledger & commission settlement (20% platform fee, restaurant payouts, rider wallet).
- [ ] **Phase 7**: Admin command center (approvals, live monitor, coupons, audit logs).
- [ ] **Phase 8**: Production polish, error boundaries, PDF invoice receipts, PWA manifest.
- [ ] **Phase 9**: Deployment guides for Vercel, Render, and Neon/Supabase.

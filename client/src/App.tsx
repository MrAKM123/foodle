import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage.js';
import { RegisterPage } from './pages/auth/RegisterPage.js';
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage.js';
import { CustomerLayout } from './layouts/CustomerLayout.js';
import { CustomerHome } from './pages/customer/CustomerHome.js';
import { RestaurantPage } from './pages/customer/RestaurantPage.js';
import { CartPage } from './pages/customer/CartPage.js';
import { CheckoutPage } from './pages/customer/CheckoutPage.js';
import { OrderSuccessPage } from './pages/customer/OrderSuccessPage.js';
import { OrdersHistoryPage } from './pages/customer/OrdersHistoryPage.js';
import { FavoritesPage } from './pages/customer/FavoritesPage.js';
import { LiveOrderTrackingPage } from './pages/customer/LiveOrderTrackingPage.js';
import { RestaurantLayout } from './layouts/RestaurantLayout.js';
import { RestaurantDashboard } from './pages/restaurant/RestaurantDashboard.js';
import { RestaurantMenuPage } from './pages/restaurant/RestaurantMenuPage.js';
import { RestaurantEarningsPage } from './pages/restaurant/RestaurantEarningsPage.js';
import { RestaurantReviewsPage } from './pages/restaurant/RestaurantReviewsPage.js';
import { RestaurantSettingsPage } from './pages/restaurant/RestaurantSettingsPage.js';
import { RiderLayout } from './layouts/RiderLayout.js';
import { RiderDashboard } from './pages/rider/RiderDashboard.js';
import { RiderWalletPage } from './pages/rider/RiderWalletPage.js';
import { RiderHistoryPage } from './pages/rider/RiderHistoryPage.js';
import { RiderProfilePage } from './pages/rider/RiderProfilePage.js';
import { AdminLayout } from './layouts/AdminLayout.js';
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { AdminRestaurantsPage } from './pages/admin/AdminRestaurantsPage.js';
import { AdminRidersPage } from './pages/admin/AdminRidersPage.js';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage.js';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage.js';
import { AdminSettlementsPage } from './pages/admin/AdminSettlementsPage.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />

      {/* 1. Customer Section (/app) */}
      <Route path="/app" element={<CustomerLayout />}>
        <Route index element={<CustomerHome />} />
        <Route path="restaurant/:slug" element={<RestaurantPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route
          path="checkout"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="order-success/:orderId"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:orderId/track"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <LiveOrderTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <OrdersHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route path="favorites" element={<FavoritesPage />} />
      </Route>

      {/* 2. Restaurant Partner Portal (/restaurant) */}
      <Route
        path="/restaurant"
        element={
          <ProtectedRoute allowedRoles={['RESTAURANT', 'ADMIN']}>
            <RestaurantLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RestaurantDashboard />} />
        <Route path="menu" element={<RestaurantMenuPage />} />
        <Route path="earnings" element={<RestaurantEarningsPage />} />
        <Route path="reviews" element={<RestaurantReviewsPage />} />
        <Route path="settings" element={<RestaurantSettingsPage />} />
      </Route>

      {/* 3. Rider Hero App (/rider) */}
      <Route
        path="/rider"
        element={
          <ProtectedRoute allowedRoles={['RIDER', 'ADMIN']}>
            <RiderLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RiderDashboard />} />
        <Route path="wallet" element={<RiderWalletPage />} />
        <Route path="history" element={<RiderHistoryPage />} />
        <Route path="profile" element={<RiderProfilePage />} />
      </Route>

      {/* 4. Super Admin Command Center (/admin) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="restaurants" element={<AdminRestaurantsPage />} />
        <Route path="riders" element={<AdminRidersPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="commissions" element={<AdminSettlementsPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="users" element={<AdminDashboard />} />
        <Route path="support" element={<AdminDashboard />} />
        <Route path="audit" element={<AdminDashboard />} />
      </Route>

      {/* Root redirect to Customer App */}
      <Route path="/" element={<Navigate to="/app" replace />} />

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;

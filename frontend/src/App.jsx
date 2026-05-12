import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layout
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/Home';
import ProductList from './pages/products/ProductList';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/orders/CheckoutPage';
import OrderSuccessPage from './pages/orders/OrderSuccessPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import ProfilePage from './pages/auth/ProfilePage';
import WishlistPage from './pages/products/WishlistPage';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductList />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Customer Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="cart" element={<CartPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order-success/:orderId" element={<OrderSuccessPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/products" element={<AdminProducts />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

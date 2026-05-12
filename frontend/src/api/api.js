import api from './axios';

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const productApi = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/categories'),
  // Admin only
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  uploadImage: (formData) => api.post('/upload/product-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const cartApi = {
  getCart: () => api.get('/cart'),
  addItem: (data) => api.post('/cart', data),
  updateItem: (productId, quantity) => api.put(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId) => api.delete(`/cart/items/${productId}`),
  clearCart: () => api.delete('/cart'),
};

export const orderApi = {
  checkout: (data) => api.post('/orders/checkout', data),
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  // Admin only
  getAdminStats: () => api.get('/admin/stats'),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  getAllUsers: (params) => api.get('/admin/users', { params }),
};

export const wishlistApi = {
  getWishlist: () => api.get('/wishlist'),
  addItem: (productId) => api.post(`/wishlist/${productId}`),
  removeItem: (productId) => api.delete(`/wishlist/${productId}`),
};

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production' 
    ? window.location.origin 
    : 'http://localhost:8000'
);

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  getFeatured: () => api.get('/products/featured/popular'),
  getRecommendations: () => api.get('/products/recommendations/personal'),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (item) => api.post('/cart/add', item),
  update: (itemId, data) => api.put(`/cart/update/${itemId}`, data),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}`),
  clear: () => api.delete('/cart/clear'),
};

// Orders API
export const ordersAPI = {
  create: (orderData) => api.post('/orders/create', orderData),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  reorder: (id) => api.post(`/orders/${id}/reorder`),
  // Admin endpoints
  getAll: (params) => api.get('/orders/admin/all', { params }),
  updateStatus: (id, status) => api.put(`/orders/admin/${id}/status`, { status }),
};

// Reviews API
export const reviewsAPI = {
  getByProduct: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  create: (reviewData) => api.post('/reviews/create', reviewData),
  update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/reviews/${id}`),
  getMyReviews: (params) => api.get('/reviews/my-reviews', { params }),
  // Admin endpoints
  getPending: (params) => api.get('/reviews/admin/pending', { params }),
  approve: (id, isApproved) => api.put(`/reviews/admin/${id}/approve`, { is_approved: isApproved }),
};

// Favorites API
export const favoritesAPI = {
  get: () => api.get('/favorites'),
  add: (productId) => api.post('/favorites/add', { product_id: productId }),
  remove: (productId) => api.delete(`/favorites/remove/${productId}`),
  check: (productId) => api.get(`/favorites/check/${productId}`),
};

export default api;

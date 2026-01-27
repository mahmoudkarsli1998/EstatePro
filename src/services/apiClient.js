import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Disabled for CORS compatibility with wildcard origin
});

// Request Interceptor: Attach Token and handle FormData
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // For FormData (file uploads), let the browser set Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token');
      // Prevent redirect on login page, invite-accept page, and public pages
      const pathname = window.location.pathname;
      const excludedPaths = ['/login', '/invite-accept', '/register'];
      const isExcluded = excludedPaths.some(path => pathname.includes(path));
      
      if (!isExcluded) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

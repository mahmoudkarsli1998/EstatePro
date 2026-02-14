import axios from 'axios';
import axiosRetry from 'axios-retry';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Disabled for CORS compatibility with wildcard origin
  timeout: 10000, // 10 seconds timeout
});

// Configure automatic retries for more resilient API communication
axiosRetry(apiClient, { 
  retries: 3, // Retry 3 times
  retryDelay: (retryCount) => {
    console.log(`🔄 API Busy: Retrying attempt ${retryCount}...`);
    return retryCount * 2000; // Exponential backoff: 2s, 4s, 6s
  },
  retryCondition: (error) => {
    // Only retry on network errors or 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error.response && error.response.status >= 500);
  },
  shouldResetTimeout: true, // Reset timeout for each retry
});

// Helper to identify anonymous visitors for AI sessions
const getVisitorId = () => {
  let id = localStorage.getItem('estatepro_visitor_id');
  if (!id) {
    id = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('estatepro_visitor_id', id);
  }
  return id;
};

// Request Interceptor: Attach Token, Visitor ID, and handle FormData
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Attach Visitor ID for AI sessions (Essential for CORS compatibility)
    config.headers['x-visitor-id'] = getVisitorId();
    
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

// Response Interceptor: Extract data and handle common errors
apiClient.interceptors.response.use(
  (response) => {
    // Always return data property
    return response.data;
  },
  (error) => {
    // Global Authentication Handling (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      const pathname = window.location.pathname;
      const excludedPaths = ['/login', '/invite-accept', '/register'];
      const isExcluded = excludedPaths.some(path => pathname.includes(path));
      
      if (!isExcluded) {
        window.location.href = '/login';
      }
    }

    // Enhance error object for UI feedback
    const enhancedError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status,
      code: error.code,
      originalError: error
    };

    return Promise.reject(enhancedError);
  }
);

export default apiClient;

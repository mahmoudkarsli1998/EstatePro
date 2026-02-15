import axios from 'axios';
import axiosRetry from 'axios-retry';

// Create the base axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Disabled for CORS compatibility with wildcard origin
  timeout: 10000, // 10 seconds timeout
});

// Request deduplication: Map to track in-flight requests
const inFlightRequests = new Map();

// Request queue for limiting concurrent API calls
const requestQueue = [];
const MAX_CONCURRENT_REQUESTS = 5;
let activeRequests = 0;

// Generate a unique key for a request
const getRequestKey = (config) => {
  const { method, url, params, data } = config;
  return `${method}:${url}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`;
};

// Process the request queue
const processQueue = () => {
  while (activeRequests < MAX_CONCURRENT_REQUESTS && requestQueue.length > 0) {
    const { config, resolve, reject } = requestQueue.shift();
    activeRequests++;
    axiosInstance(config)
      .then(resolve)
      .catch(reject)
      .finally(() => {
        activeRequests--;
        processQueue();
      });
  }
};

// Custom request method with deduplication and queue
const queuedRequest = (config) => {
  const requestKey = getRequestKey(config);
  
  // Check if there's already an in-flight request with the same key
  if (inFlightRequests.has(requestKey)) {
    console.log(`🔗 Deduplicating request: ${requestKey}`);
    return inFlightRequests.get(requestKey);
  }
  
  // If we're at max concurrent requests, queue this one
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    console.log(`📋 Queueing request: ${requestKey} (queue length: ${requestQueue.length + 1})`);
    return new Promise((resolve, reject) => {
      requestQueue.push({ config, resolve, reject });
    });
  }
  
  // Execute the request
  activeRequests++;
  console.log(`🚀 Executing request: ${requestKey} (active: ${activeRequests})`);
  const promise = axiosInstance(config);
  
  // Store the promise for deduplication
  inFlightRequests.set(requestKey, promise);
  
  // Clean up after request completes
  promise
    .finally(() => {
      inFlightRequests.delete(requestKey);
      activeRequests--;
      processQueue();
    });
  
  return promise;
};

// Override the request method to use our custom queue/deduplication
axiosInstance.request = function(config) {
  return queuedRequest(config);
};

// Also override HTTP method shortcuts to use the queue
['get', 'delete', 'head', 'options'].forEach(method => {
  axiosInstance[method] = function(url, config = {}) {
    return queuedRequest({ ...config, method, url });
  };
});

['post', 'put', 'patch'].forEach(method => {
  axiosInstance[method] = function(url, data = {}, config = {}) {
    return queuedRequest({ ...config, method, url, data });
  };
});

// Configure automatic retries for more resilient API communication
// Also handle 429 Too Many Requests with exponential backoff
axiosRetry(axiosInstance, { 
  retries: 3, // Retry 3 times
  retryDelay: (retryCount) => {
    console.log(`🔄 API Busy: Retrying attempt ${retryCount}...`);
    return retryCount * 2000; // Exponential backoff: 2s, 4s, 6s
  },
  retryCondition: (error) => {
    // Retry on network errors, 5xx server errors, OR 429 Too Many Requests
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error.response && (error.response.status >= 500 || error.response.status === 429));
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
axiosInstance.interceptors.request.use(
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
axiosInstance.interceptors.response.use(
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

// Export the configured axios instance
export default axiosInstance;

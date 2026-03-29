// Frontend/src/api/apiClient.js - COMPLETE FIXED VERSION
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Create a unique tab ID for this session
const getTabId = () => {
  let tabId = sessionStorage.getItem('tabId');
  if (!tabId) {
    tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('tabId', tabId);
  }
  return tabId;
};

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});



// Auth storage helper with full implementation
export const authStorage = {
  // Save auth data with tab isolation
  saveAuth: (type, token, data, refreshToken) => {
    const tabId = getTabId();
    
    // Save to sessionStorage with tab ID (isolated per tab)
    sessionStorage.setItem(`${type}Token_${tabId}`, token);
    sessionStorage.setItem(`${type}Data_${tabId}`, JSON.stringify(data));
    
    // Also save to localStorage for persistence across tabs
    localStorage.setItem(`${type}Token`, token);
    localStorage.setItem(`${type}Data`, JSON.stringify(data));

    localStorage.setItem(`${type}RefreshToken`, refreshToken)
    
    console.log(`✅ Saved ${type} auth data`);
  },
  
  // Get auth data (checks sessionStorage first, then localStorage)
  getAuth: (type) => {
    const tabId = getTabId();
    
    // Try sessionStorage first with tab-specific key
    let token = sessionStorage.getItem(`${type}Token_${tabId}`);
    let dataStr = sessionStorage.getItem(`${type}Data_${tabId}`);
    
    // If not found, try sessionStorage without tab ID
    if (!token) {
      token = sessionStorage.getItem(`${type}Token`);
      dataStr = sessionStorage.getItem(`${type}Data`);
    }
    
    // If still not found, try localStorage
    if (!token) {
      token = localStorage.getItem(`${type}Token`);
      dataStr = localStorage.getItem(`${type}Data`);
    }
    
    let data = null;
    if (dataStr) {
      try {
        data = JSON.parse(dataStr);
      } catch (e) {
        console.error(`Error parsing ${type} data:`, e);
      }
    }
    
    return {
      token,
      data
    };
  },
  
  // Clear auth data for a specific type
  clearAuth: (type) => {
    const tabId = getTabId();
    
    // Clear sessionStorage
    sessionStorage.removeItem(`${type}Token_${tabId}`);
    sessionStorage.removeItem(`${type}Data_${tabId}`);
    sessionStorage.removeItem(`${type}Token`);
    sessionStorage.removeItem(`${type}Data`);
    
    // Clear localStorage
    localStorage.removeItem(`${type}Token`);
    localStorage.removeItem(`${type}Data`);
    
    console.log(`🧹 Cleared ${type} auth`);
  },
  
  // Clear all auth data
  clearAllAuth: () => {
    const tabId = getTabId();
    
    // Clear all sessionStorage items
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.includes('Token') || key.includes('Data')) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Clear localStorage auth items
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('panditToken');
    localStorage.removeItem('panditData');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    
    console.log('🧹 Cleared all auth');
  },
  
  // Clear tab-specific auth
  clearTabAuth: () => {
    const tabId = getTabId();
    const keysToRemove = [];
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key.includes(tabId)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
    console.log(`🧹 Cleared auth for tab ${tabId}`);
  }
};
const verifyTokenBeforeRequest = (config) => {
  // Skip token check for public routes
  const isPublicRoute = 
    config.url?.includes("/auth/login") ||
    config.url?.includes("/admin/login") ||
    config.url?.includes("/pandit/auth/login") ||
    config.url?.includes("/user/login") ||
    config.url?.includes("/user/register") ||
config.url === "/pandits" ||
config.url === "/services" ||
    (config.url === "/bookings" && config.method === "post");

  if (isPublicRoute) {
    console.log('   ✅ Public route - skipping token check');
    return { valid: true, isPublic: true };
  }
  
  // Determine auth type from URL
  let authType = null;
  let token = null;
  
  if (config.url?.startsWith('/admin/') && config.method !== 'options') {
    authType = 'admin';
    const auth = authStorage.getAuth('admin');
    token = auth?.token;
  } else if (config.url?.startsWith('/pandit/') && config.method !== 'options') {
    authType = 'pandit';
    const auth = authStorage.getAuth('pandit');
    token = auth?.token;
  } else if (config.url?.startsWith('/user/') && config.method !== 'options') {
    authType = 'user';
    const auth = authStorage.getAuth('user');
    token = auth?.token;
  } else if (config.url?.startsWith('/bookings') && config.method !== 'post' && config.method !== 'options') {
    authType = 'user';
    const auth = authStorage.getAuth('user');
    token = auth?.token;
  }

  // If no auth type determined, it's likely a route that doesn't need auth
  if (!authType) {
    return { valid: true };
  }
  
  // Check for token
  if (!token) {
    console.log(`❌ No ${authType} token found before request`);
    return { 
      valid: false, 
      authType, 
      reason: 'no_token',
      redirect: authType === 'admin' ? '/admin-login' : 
                authType === 'pandit' ? '/pandit-login' : '/user/login'
    };
  }
  
  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000;
    if (Date.now() >= expiry) {
      console.log(`⚠️ ${authType} token expired`);
      authStorage.clearAuth(authType);
      return { 
        valid: false, 
        authType, 
        reason: 'expired',
        redirect: authType === 'admin' ? '/admin-login' : 
                  authType === 'pandit' ? '/pandit-login' : '/user/login'
      };
    }
  } catch (e) {
    console.log('Could not verify token expiry:', e);
    return { 
      valid: false, 
      authType, 
      reason: 'invalid',
      redirect: authType === 'admin' ? '/admin-login' : 
                authType === 'pandit' ? '/pandit-login' : '/user/login'
    };
  }
  
  // Token is valid
  return { valid: true, authType, token };
};

// REQUEST INTERCEPTOR - USING verifyTokenBeforeRequest
api.interceptors.request.use((config) => {
  console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
  
  // Use verifyTokenBeforeRequest to check token validity
  const verification = verifyTokenBeforeRequest(config);
  
  // Handle invalid token cases
  if (!verification.valid) {
    console.log(`   ❌ Token verification failed: ${verification.reason}`);
    
    // Redirect to login if on the corresponding page
    if (verification.authType && 
        window.location.pathname.startsWith(`/${verification.authType}`)) {
      console.log(`🔄 Redirecting to ${verification.redirect}`);
      window.location.href = verification.redirect;
    }
    
    // Reject the request
    return Promise.reject(new Error(`Token ${verification.reason}`));
  }
  
  // Add token to headers if available
  if (verification.token) {
    config.headers.Authorization = `Bearer ${verification.token}`;
    console.log(`   ✅ Added ${verification.authType} token to headers`);
    console.log(`   Authorization header: ${config.headers.Authorization.substring(0, 30)}...`);
  } else if (verification.isPublic) {
    console.log('   ✅ Public route - no token needed');
  }
  
  return config;
});

// Token refresh state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// RESPONSE INTERCEPTOR - Enhanced with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not a login request and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Determine auth type from URL
      let authType = null;
      if (originalRequest.url?.startsWith('/admin/')) authType = 'admin';
      else if (originalRequest.url?.startsWith('/pandit/')) authType = 'pandit';
      else if (originalRequest.url?.startsWith('/user/')) authType = 'user';
      else if (originalRequest.url?.startsWith('/bookings')) authType = 'user';
      
      // If this is a protected route, try to refresh or redirect
      if (authType) {
        // Check if we have a refresh token
        const auth = authStorage.getAuth(authType);
        const refreshToken = auth?.refreshToken;
        
        // If we have a refresh token, try to refresh
        if (refreshToken && !isRefreshing) {
          originalRequest._retry = true;
          isRefreshing = true;
          
          try {
            // Call refresh token endpoint
            const response = await api.post(`/${authType}/auth/refresh`, {
              refreshToken
            });
            
            const newToken = response.data.token;
            
            // Update stored token
            authStorage.saveAuth(authType, newToken, auth.data, refreshToken);
            
            // Update authorization header
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Process queued requests
            processQueue(null, newToken);
            
            // Retry the original request
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear auth and redirect
            console.log(`❌ Token refresh failed for ${authType}`);
            authStorage.clearAuth(authType);
            processQueue(refreshError, null);
            
            // Redirect to login
            const redirectMap = {
              admin: '/admin-login',
              pandit: '/pandit-login',
              user: '/user/login'
            };
            
            if (window.location.pathname.startsWith(`/${authType}`)) {
              window.location.href = redirectMap[authType];
            }
            
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } 
        // If no refresh token, just clear and redirect
        else {
          console.log(`❌ No refresh token for ${authType}, clearing auth`);
          authStorage.clearAuth(authType);
          
          // Redirect to login
          const redirectMap = {
            admin: '/admin-login',
            pandit: '/pandit-login',
            user: '/user/login'
          };
          
          if (window.location.pathname.startsWith(`/${authType}`)) {
            window.location.href = redirectMap[authType];
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
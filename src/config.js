// Frontend/src/config.js

const getApiUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL || '/api';
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 30000,
};

export const buildUrl = (endpoint) => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  
  if (!cleanEndpoint) {
    console.error('❌ buildUrl called with empty endpoint');
    return baseUrl;
  }
  
  return `${baseUrl}/${cleanEndpoint}`;
};

// Add this if you want to export BASE_URL directly
export const API_BASE_URL = API_CONFIG.BASE_URL;

export default API_CONFIG;
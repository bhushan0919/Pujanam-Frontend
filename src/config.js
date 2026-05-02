// UPDATE for production
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;
  
  // IMPORTANT: Change this to your Render backend URL
  if (import.meta.env.PROD) {
    return 'https://pujanam-backend.onrender.com/api';  // ← CHANGE THIS
  }
  
  return 'http://localhost:5000';
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 30000,
};

export const buildUrl = (endpoint) => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return `${baseUrl}/${cleanEndpoint}`;
};

export default API_CONFIG;
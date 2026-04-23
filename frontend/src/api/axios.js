import axios from 'axios';

const api = axios.create({
  // 🔒 CORRECCIÓN: Quitamos el código de Vite y usamos la ruta correcta de Next.js
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request: adjunta JWT del localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: si 401 limpia sesión y redirige
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      // Lo ajusté a '/web' porque vi en tu index.js que esa es tu ruta de salida real
      window.location.href = '/web'; 
    }
    return Promise.reject(error);
  }
);

export default api;
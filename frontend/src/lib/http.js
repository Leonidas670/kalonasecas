import axios from "axios";

// Obtiene la URL base de la API desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Cambié a true para enviar cookies si las usas
  headers: {
    'Content-Type': 'application/json',
  }
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores globalmente (opcional pero útil)
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem("token");
      window.location.href = '/login'; // Ajusta según tu ruta de login
    }
    return Promise.reject(error);
  }
);

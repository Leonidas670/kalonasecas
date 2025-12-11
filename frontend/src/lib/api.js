import axios from "axios";

// Obtiene la URL base de la API desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

console.log('🔧 API Base URL:', API_BASE_URL); // Para debug

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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
      // Opcional: redirigir al login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Realiza una petición POST a la API con datos en formato JSON.
 * @param {string} path La ruta del endpoint de la API (ej. '/auth/login').
 * @param {object} data Los datos a enviar en el cuerpo de la petición.
 * @param {RequestInit} [init] Opciones adicionales para la petición `fetch`.
 * @returns {Promise<object>} La respuesta de la API en formato JSON.
 */
export async function postJSON(path, data, init) {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      ...(init?.headers || {}) 
    },
    body: JSON.stringify(data),
    credentials: 'include',
    ...init,
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  
  return res.json();
}

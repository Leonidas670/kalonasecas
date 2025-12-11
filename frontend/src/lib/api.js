/**
 * Módulo de utilidades para interactuar con la API del backend.
 * Centraliza las llamadas HTTP para mantener el código más limpio y reutilizable.
 */

// Obtiene la URL base de la API desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Realiza una petición POST a la API con datos en formato JSON.
 * @param {string} path La ruta del endpoint de la API (ej. '/auth/login').
 * @param {object} data Los datos a enviar en el cuerpo de la petición, se serializarán a JSON.
 * @param {RequestInit} [init] Opciones adicionales para la petición `fetch`.
 * @returns {Promise<object>} La respuesta de la API en formato JSON.
 * @throws {Error} Si la respuesta HTTP no es exitosa (status `!res.ok`).
 */
export async function postJSON(path, data, init) {
  // Construye la URL completa usando la base URL
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      ...(init?.headers || {}) 
    },
    body: JSON.stringify(data),
    credentials: 'include', // Para enviar cookies si las usas
    ...init,
  });
  
  // Si la respuesta no es exitosa (ej. 4xx, 5xx), lanza un error con el estado y el texto de la respuesta.
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  
  // Parsea y retorna la respuesta como JSON.
  return res.json();
}

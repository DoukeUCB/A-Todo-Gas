/**
 * Configuración de la API para el frontend
 */
const API_CONFIG = {
  // URL base de la API en producción
  baseURL: 'https://quickgasoline.onrender.com',
  
  // Si estamos en desarrollo local, usar la API local
  getBaseURL: function() {
    // Detectar si estamos en desarrollo (localhost) o producción
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    return this.baseURL;
  },
  
  // Construir una URL completa para la API
  buildURL: function(endpoint) {
    return `${this.getBaseURL()}${endpoint}`;
  },
  
  // Headers comunes para todas las solicitudes
  getHeaders: function() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  },
  
  // Función para solicitudes fetch con manejo de errores consistente
  fetchAPI: async function(endpoint, options = {}) {
    const url = this.buildURL(endpoint);
    const headers = this.getHeaders();
    
    const fetchOptions = {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    };
    
    try {
      const response = await fetch(url, fetchOptions);
      
      // Si no es OK, convertir a error
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error HTTP: ${response.status} ${response.statusText}`
        }));
        
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error en solicitud a ${endpoint}:`, error);
      
      // Rethrow con mensaje más claro si es un error de red
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Error de conexión. Intente nuevamente más tarde.');
      }
      
      throw error;
    }
  }
};

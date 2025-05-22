/**
 * Configuración de la API para el frontend
 * Detecta automáticamente si estamos en desarrollo local o producción
 */
const API_CONFIG = {
  // URL base para producción (servidor en Render)
  prodURL: 'https://quickgasoline.onrender.com',
  
  // URL base para desarrollo local
  devURL: 'http://localhost:3000',
  
  /**
   * Determina automáticamente la URL base según el entorno
   * @returns {string} URL base para las solicitudes API
   */
  getBaseURL: function() {
    // Detectar si estamos en desarrollo (localhost) o producción
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('192.168.');
    
    const baseURL = isLocalhost ? this.devURL : this.prodURL;
    console.log(`API_CONFIG: Usando ${isLocalhost ? 'entorno DEV' : 'entorno PROD'} - ${baseURL}`);
    return baseURL;
  },
  
  /**
   * Método para realizar solicitudes a la API con manejo de errores mejorado
   * @param {string} endpoint - Endpoint a llamar (ej: '/api/users/login')
   * @param {Object} options - Opciones para fetch (method, headers, body, etc)
   * @returns {Promise<any>} Datos de la respuesta
   */
  async fetchAPI(endpoint, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // No usar 'same-origin' en producción porque estamos en dominios diferentes
      credentials: window.location.hostname === 'localhost' ? 'same-origin' : 'omit'
    };
    
    const fetchOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {})
      }
    };
    
    try {
      // Construir URL completa
      const baseURL = this.getBaseURL();
      const url = `${baseURL}${endpoint}`;
      
      console.log(`🔄 Enviando solicitud a ${url}`, {
        method: fetchOptions.method || 'GET',
        headers: fetchOptions.headers,
        bodySize: fetchOptions.body ? fetchOptions.body.length : 0
      });
      
      const response = await fetch(url, fetchOptions);
      
      let data;
      const contentType = response.headers.get('Content-Type') || '';
      
      if (contentType.includes('application/json')) {
        data = await response.json();
        console.log(`✅ Respuesta JSON de ${url}:`, {
          status: response.status,
          success: data.success,
          message: data.message
        });
      } else {
        data = await response.text();
        console.log(`✅ Respuesta texto de ${url}:`, {
          status: response.status,
          textLength: data.length
        });
        
        // Si parece ser JSON, tratar de parsearlo
        if (data && (data.trim().startsWith('{') || data.trim().startsWith('['))) {
          try {
            data = JSON.parse(data);
          } catch (e) {
            console.warn("No se pudo parsear la respuesta como JSON");
          }
        }
      }
      
      // Si la respuesta no es exitosa, lanzar error
      if (!response.ok) {
        const errorMsg = data && data.message ? data.message : 'Error en la solicitud';
        throw new Error(errorMsg);
      }
      
      return data;
    } catch (error) {
      // Errores de red
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.error('❌ Error de conexión:', error);
        const baseURL = this.getBaseURL();
        
        if (baseURL.includes('localhost')) {
          throw new Error(`Error de conexión al servidor local (${baseURL}). Asegúrate de que el servidor esté ejecutándose con 'npm run dev'.`);
        } else {
          throw new Error(`Error de conexión a ${baseURL}. Verifica tu conexión a internet o si el servidor está caído.`);
        }
      }
      
      console.error('❌ Error en solicitud API:', error);
      throw error;
    }
  }
};

// Log al cargar el script
console.log('API_CONFIG cargado. URL base:', API_CONFIG.getBaseURL());

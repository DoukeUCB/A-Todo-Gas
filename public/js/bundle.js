// Este archivo hace disponibles las funciones de la aplicación en el navegador
(function() {
  // Clase ApiClient para llamadas al backend
  class ApiClient {
    constructor(baseUrl) {
      this.baseUrl = baseUrl || '/api';
    }
    
    async get(endpoint, queryParams = {}) {
      const url = new URL(this.baseUrl + endpoint, window.location.origin);
      Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]));
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en la solicitud');
      }
      
      return await response.json();
    }
    
    async post(endpoint, data) {
      const url = this.baseUrl + endpoint;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en la solicitud');
      }
      
      return await response.json();
    }
    
    async put(endpoint, data) {
      const url = this.baseUrl + endpoint;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en la solicitud');
      }
      
      return await response.json();
    }
  }
  
  // El cliente API centralizado
  const apiClient = new ApiClient();
  
  // Implementaciones de los servicios usando el API real
  class UserService {
    constructor() {
      console.log('UserService inicializado');
    }
    
    async login(ci, password) {
      try {
        const response = await apiClient.post('/users/login', { ci, password });
        return response.data;
      } catch (error) {
        throw new Error(error.message || 'Error al iniciar sesión');
      }
    }
    
    async register(userData) {
      try {
        const response = await apiClient.post('/users/register', userData);
        return response.data;
      } catch (error) {
        throw new Error(error.message || 'Error al registrar usuario');
      }
    }
  }
  
  class GasStationService {
    constructor() {
      console.log('GasStationService inicializado');
    }
    
    async getAllStations() {
      try {
        const response = await apiClient.get('/gas-stations');
        return response.data;
      } catch (error) {
        throw new Error(error.message || 'Error al obtener gasolineras');
      }
    }
    
    async getStationById(id) {
      try {
        const response = await apiClient.get(`/gas-stations/${id}`);
        return response.data;
      } catch (error) {
        throw new Error(error.message || 'Error al obtener la gasolinera');
      }
    }
    
    async getStationByManagerCI(ci) {
      try {
        const response = await apiClient.get(`/gas-stations/manager/${ci}`);
        return response.data;
      } catch (error) {
        if (error.message.includes('No se encontró')) {
          return null;
        }
        throw new Error(error.message || 'Error al buscar la gasolinera');
      }
    }
    
    async createStation(stationData) {
      try {
        const response = await apiClient.post('/gas-stations', stationData);
        return response.data;
      } catch (error) {
        throw new Error(error.message || 'Error al crear la gasolinera');
      }
    }
    
    async updateStation(id, updateData) {
      try {
        const response = await apiClient.put(`/gas-stations/${id}`, updateData);
        return response.data;
      } catch (error) {
        throw new Error(error.message || 'Error al actualizar la gasolinera');
      }
    }
  }
  
  class TicketService {
    constructor() {
      console.log('TicketService inicializado');
    }
    
    async createTicket(ticketData) {
      try {
        const response = await apiClient.post('/tickets', ticketData);
        return response.data;
      } catch (error) {
        throw new Error(error.message || 'Error al crear el ticket');
      }
    }
    
    async getTicketsByUserCI(ci) {
      try {
        const response = await apiClient.get('/tickets', { ci });
        return response.data;
      } catch (error) {
        throw new Error(error.message || 'Error al obtener los tickets');
      }
    }
    
    async getTicketsByStationId(stationId) {
      try {
        const response = await apiClient.get('/tickets', { stationId });
        return response.data;
      } catch (error) {
        throw new Error(error.message || 'Error al obtener los tickets');
      }
    }
  }
  
  class WebUIAdapter {
    constructor(userService, gasStationService, ticketService) {
      this.userService = userService;
      this.gasStationService = gasStationService;
      this.ticketService = ticketService;
      this.currentView = null;
      this.rootElement = null;
    }

    initialize(rootElementId) {
      if (typeof rootElementId === 'string') {
        this.rootElement = document.getElementById(rootElementId);
      } else {
        this.rootElement = rootElementId;
      }

      if (!this.rootElement) {
        throw new Error('Elemento raíz no encontrado');
      }

      this._setupEventListeners();
      return this;
    }

    _setupEventListeners() {
      console.log('Event listeners configurados');
    }

    navigateTo(viewName, params = {}) {
      console.log(`Navegando a: ${viewName}`, params);
      this.currentView = viewName;
      
      if (viewName === 'login') {
        this._renderLoginView();
      } else if (viewName === 'register') {
        this._renderRegisterView();
      } else if (viewName === 'dashboard') {
        this._renderDashboardView(params);
      } else {
        this._renderNotFoundView();
      }
    }
    
    showNotification(type, message) {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('notification-hide');
        setTimeout(() => notification.remove(), 500);
      }, 5000);
    }

    getCurrentUser() {
      const userData = localStorage.getItem('currentUser');
      return userData ? JSON.parse(userData) : null;
    }

    async handleLogin(ci, password) {
      try {
        const user = await this.userService.login(ci, password);
        
        localStorage.setItem('currentUser', JSON.stringify({
          id: user.id,
          fullName: user.fullName,
          role: user.role,
          ci: user.ci
        }));
        
        this.showNotification('success', 'Inicio de sesión exitoso');
        
        if (user.role === 'conductor') {
          window.location.href = '/dashboard.html';
        } else if (user.role === 'gasolinera') {
          window.location.href = '/admin-dashboard.html';
        }
      } catch (error) {
        this.showNotification('error', error.message || 'Error al iniciar sesión');
      }
    }

    async handleRegister(userData) {
      try {
        const user = await this.userService.register(userData);
        this.showNotification('success', 'Usuario registrado correctamente');
        
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 1500);
      } catch (error) {
        this.showNotification('error', error.message || 'Error al registrar usuario');
      }
    }

    _renderLoginView() {
      this.rootElement.innerHTML = `
        <div class="auth-container">
          <h2>Iniciar Sesión</h2>
          <form id="login-form">
            <div class="form-group">
              <label for="ci">Carnet de Identidad (CI)</label>
              <input type="text" id="ci" name="ci" required pattern="[0-9]+" placeholder="Ej: 12345678">
              <small>Ingrese solo números</small>
            </div>
            <div class="form-group">
              <label for="password">Contraseña</label>
              <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn btn-primary">Iniciar Sesión</button>
          </form>
          <p>¿No tienes una cuenta? <a href="/registro.html">Regístrate aquí</a></p>
        </div>
      `;
      
      document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const ci = document.getElementById('ci').value;
        const password = document.getElementById('password').value;
        this.handleLogin(ci, password);
      });
    }

    _renderRegisterView() {
      this.rootElement.innerHTML = `
        <div class="auth-container">
          <h2>Registro de Usuario</h2>
          <form id="register-form">
            <div class="form-group">
              <label for="fullName">Nombre Completo</label>
              <input type="text" id="fullName" name="fullName" required>
            </div>
            <div class="form-group">
              <label for="ci">CI</label>
              <input type="text" id="ci" name="ci" required pattern="[0-9]+" placeholder="Ej: 12345678">
              <small>Ingrese solo números</small>
            </div>
            <div class="form-group">
              <label for="email">Correo Electrónico</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="phone">Teléfono</label>
              <input type="text" id="phone" name="phone" required pattern="[0-9+ -]+">
            </div>
            <div class="form-group">
              <label for="password">Contraseña</label>
              <input type="password" id="password" name="password" required>
            </div>
            <div class="form-group">
              <label for="role">Rol</label>
              <select id="role" name="role" required>
                <option value="conductor">Conductor</option>
                <option value="gasolinera">Administrador de Gasolinera</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary">Registrarse</button>
          </form>
          <p>¿Ya tienes una cuenta? <a href="/login.html">Inicia sesión aquí</a></p>
        </div>
      `;
      
      document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = {
          fullName: formData.get('fullName'),
          ci: formData.get('ci'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          password: formData.get('password'),
          role: formData.get('role')
        };
        this.handleRegister(userData);
      });
    }

    _renderDashboardView() {
      const user = this.getCurrentUser();
      this.rootElement.innerHTML = `
        <div class="dashboard-container">
          <h2>Dashboard</h2>
          <p>Bienvenido ${user ? user.fullName : 'Usuario'}</p>
        </div>
      `;
    }

    _renderNotFoundView() {
      this.rootElement.innerHTML = `
        <div class="not-found-container">
          <h2>Página no encontrada</h2>
          <p>La página que buscas no existe.</p>
        </div>
      `;
    }
    
    _timeStringToDate(timeStr) {
      const date = new Date();
      const [hours, minutes] = timeStr.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
  }

  function initializeApp(rootElementId) {
    try {
      console.log('Inicializando aplicación QuickGasoline...');
      
      const userService = new UserService();
      const gasStationService = new GasStationService();
      const ticketService = new TicketService();
      
      const webAdapter = new WebUIAdapter(userService, gasStationService, ticketService);
      
      webAdapter.initialize(rootElementId);
      
      console.log('Aplicación QuickGasoline iniciada correctamente');
      return webAdapter;
    } catch (error) {
      console.error('Error al inicializar la aplicación:', error);
      throw error;
    }
  }
  
  window.QuickGasoline = {
    initializeApp,
    UserService,
    GasStationService,
    TicketService,
    WebUIAdapter
  };
  
  console.log('Bundle de QuickGasoline cargado correctamente');
})();

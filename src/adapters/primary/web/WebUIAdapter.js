class WebUIAdapter {
  constructor(userService, gasStationService, ticketService) {
    this.userService = userService;
    this.gasStationService = gasStationService;
    this.ticketService = ticketService;
    this.currentView = null;
    this.rootElement = null;
  }

  /**
   * Inicializa el adaptador web, configurando el elemento raíz
   * @param {HTMLElement|string} rootElement - Elemento DOM o ID del elemento donde se montará la UI
   */
  initialize(rootElement) {
    if (typeof rootElement === 'string') {
      this.rootElement = document.getElementById(rootElement);
    } else {
      this.rootElement = rootElement;
    }

    if (!this.rootElement) {
      throw new Error('Elemento raíz no encontrado');
    }

    this._setupEventListeners();
    return this;
  }

  /**
   * Configura los event listeners globales
   */
  _setupEventListeners() {
    // Manejo global de errores
    window.addEventListener('error', (event) => {
      this.showNotification('error', 'Error en la aplicación: ' + event.message);
      console.error('Error en la aplicación:', event);
    });

    // Event delegation para manejar clicks en toda la aplicación
    document.addEventListener('click', (event) => {
      // Navegación
      if (event.target.matches('[data-navigate]')) {
        const view = event.target.dataset.navigate;
        this.navigateTo(view);
        event.preventDefault();
      }

      // Logout
      if (event.target.matches('[data-logout]')) {
        this.handleLogout();
        event.preventDefault();
      }
    });
  }

  /**
   * Navega a una vista específica
   * @param {string} viewName - Nombre de la vista a mostrar
   * @param {Object} params - Parámetros adicionales para la vista
   */
  navigateTo(viewName, params = {}) {
    this.currentView = viewName;
    
    // Limpiar contenido anterior
    this.rootElement.innerHTML = '';
    
    switch (viewName) {
      case 'login':
        this._renderLoginView();
        break;
      case 'register':
        this._renderRegisterView();
        break;
      case 'dashboard':
        this._renderDashboardView(params);
        break;
      case 'gasStationDetail':
        this._renderGasStationDetailView(params.stationId);
        break;
      case 'createTicket':
        this._renderCreateTicketView(params.stationId);
        break;
      case 'myTickets':
        this._renderMyTicketsView();
        break;
      default:
        this._renderNotFoundView();
    }
  }

  /**
   * Muestra una notificación al usuario
   * @param {string} type - Tipo de notificación ('success', 'error', 'info', 'warning')
   * @param {string} message - Mensaje a mostrar
   */
  showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Auto eliminar después de 5 segundos
    setTimeout(() => {
      notification.classList.add('notification-hide');
      setTimeout(() => notification.remove(), 500);
    }, 5000);
  }

  /**
   * Maneja la autenticación de usuarios
   * @param {string} ci - Carnet de identidad
   * @param {string} password - Contraseña
   */
  async handleLogin(ci, password) {
    try {
      const user = await this.userService.login(ci, password);
      
      // Guardar información de sesión
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        ci: user.ci
      }));
      
      this.showNotification('success', 'Inicio de sesión exitoso');
      
      // Redireccionar según el rol
      if (user.role === 'conductor') {
        window.location.href = '/dashboard.html';
      } else if (user.role === 'gasolinera') {
        window.location.href = '/admin-dashboard.html';
      }
    } catch (error) {
      this.showNotification('error', error.message || 'Error al iniciar sesión');
    }
  }

  /**
   * Maneja el registro de usuarios
   * @param {Object} userData - Datos del usuario a registrar
   */
  async handleRegister(userData) {
    try {
      // Utilizar el servicio directamente en lugar de hacer la petición HTTP
      // Esto asegura que se use el mismo formato y validación
      const user = await this.userService.register(userData);
      this.showNotification('success', 'Usuario registrado correctamente');
      this.navigateTo('login');
    } catch (error) {
      // Mensaje más informativo sobre errores
      console.error('Error durante el registro:', error);
      this.showNotification('error', error.message || 'Error al registrar usuario');
    }
  }

  /**
   * Maneja el cierre de sesión
   */
  handleLogout() {
    localStorage.removeItem('currentUser');
    this.showNotification('info', 'Sesión cerrada');
    this.navigateTo('login');
  }

  /**
   * Obtiene el usuario actual desde el almacenamiento local
   */
  getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Maneja la creación de gasolineras
   * @param {Object} stationData - Datos de la gasolinera a crear
   * @param {HTMLElement} container - Contenedor donde actualizar la UI
   */
  async handleCreateStation(stationData, container) {
    try {
      // Utilizar el servicio directamente 
      const station = await this.gasStationService.createStation(stationData);
      this.showNotification('success', 'Gasolinera creada correctamente');
      this._renderStationManagement(station, container);
    } catch (error) {
      console.error('Error al crear gasolinera:', error);
      this.showNotification('error', error.message || 'Error al crear la gasolinera');
    }
  }

  /**
   * Renderiza la vista de login
   */
  _renderLoginView() {
    const template = `
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
    
    this.rootElement.innerHTML = template;
    
    // Configurar el event listener para el formulario
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const ci = document.getElementById('ci').value;
      const password = document.getElementById('password').value;
      this.handleLogin(ci, password);
    });
  }

  /**
   * Renderiza la vista de registro
   */
  _renderRegisterView() {
    const template = `
      <div class="auth-container">
        <h2>Registro de Usuario</h2>
        <form id="register-form">
          <div class="form-group">
            <label for="fullName">Nombre Completo</label>
            <input type="text" id="fullName" name="fullName" required>
          </div>
          <div class="form-group">
            <label for="ci">CI</label>
            <input type="text" id="ci" name="ci" required pattern="[0-9]+">
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
        <p>¿Ya tienes una cuenta? <a href="#" data-navigate="login">Inicia sesión aquí</a></p>
      </div>
    `;
    
    this.rootElement.innerHTML = template;
    
    // Configurar el event listener para el formulario
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

  /**
   * Renderiza la vista de dashboard
   */
  async _renderDashboardView() {
    const currentUser = this.getCurrentUser();
    
    if (!currentUser) {
      this.navigateTo('login');
      return;
    }

    // Plantilla básica del dashboard
    const template = `
      <div class="dashboard-container">
        <header class="app-header">
          <h1>QuickGasoline</h1>
          <div class="user-info">
            <span>Hola, ${currentUser.fullName}</span>
            <a href="#" data-logout>Cerrar Sesión</a>
          </div>
        </header>
        
        <nav class="main-nav">
          ${currentUser.role === 'conductor' ? `
            <a href="#" class="nav-item" data-navigate="myTickets">Mis Tickets</a>
            <a href="#" class="nav-item" data-view="gasStations">Gasolineras</a>
          ` : `
            <a href="#" class="nav-item" data-view="manageStation">Administrar Gasolinera</a>
            <a href="#" class="nav-item" data-view="stationTickets">Tickets de mi Estación</a>
          `}
        </nav>
        
        <main class="main-content" id="dashboard-content">
          <div class="loading">Cargando contenido...</div>
        </main>
      </div>
    `;
    
    this.rootElement.innerHTML = template;
    
    const dashboardContent = document.getElementById('dashboard-content');
    
    // Cargar contenido inicial según el rol
    if (currentUser.role === 'conductor') {
      try {
        const stations = await this.gasStationService.getAllStations();
        this._renderStationsList(stations, dashboardContent);
      } catch (error) {
        dashboardContent.innerHTML = `
          <div class="error-message">
            Error al cargar las gasolineras: ${error.message}
          </div>
        `;
      }
    } else {
      try {
        const station = await this.gasStationService.getStationByManagerCI(currentUser.ci);
        if (station) {
          this._renderStationManagement(station, dashboardContent);
        } else {
          this._renderCreateStationForm(dashboardContent);
        }
      } catch (error) {
        dashboardContent.innerHTML = `
          <div class="error-message">
            Error al cargar información de la gasolinera: ${error.message}
          </div>
        `;
      }
    }
    
    // Event listeners para la navegación dentro del dashboard
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-view="gasStations"]')) {
        e.preventDefault();
        this.gasStationService.getAllStations()
          .then(stations => this._renderStationsList(stations, dashboardContent))
          .catch(error => {
            dashboardContent.innerHTML = `
              <div class="error-message">
                Error al cargar las gasolineras: ${error.message}
              </div>
            `;
          });
      }
      
      if (e.target.matches('[data-view="manageStation"]')) {
        e.preventDefault();
        const currentUser = this.getCurrentUser();
        this.gasStationService.getStationByManagerCI(currentUser.ci)
          .then(station => {
            if (station) {
              this._renderStationManagement(station, dashboardContent);
            } else {
              this._renderCreateStationForm(dashboardContent);
            }
          })
          .catch(error => {
            dashboardContent.innerHTML = `
              <div class="error-message">
                Error al cargar información de la gasolinera: ${error.message}
              </div>
            `;
          });
      }
      
      if (e.target.matches('[data-view="stationTickets"]')) {
        e.preventDefault();
        const currentUser = this.getCurrentUser();
        this.gasStationService.getStationByManagerCI(currentUser.ci)
          .then(station => {
            if (station) {
              return this.ticketService.getTicketsByStationId(station.id)
                .then(tickets => {
                  this._renderStationTickets(tickets, station, dashboardContent);
                });
            } else {
              dashboardContent.innerHTML = `
                <div class="info-message">
                  Debe crear una gasolinera primero
                </div>
              `;
            }
          })
          .catch(error => {
            dashboardContent.innerHTML = `
              <div class="error-message">
                Error al cargar tickets: ${error.message}
              </div>
            `;
          });
      }
    });
  }

  /**
   * Renderiza la lista de gasolineras
   * @param {Array} stations - Lista de gasolineras
   * @param {HTMLElement} container - Contenedor donde se renderizará la lista
   */
  _renderStationsList(stations, container) {
    if (stations.length === 0) {
      container.innerHTML = `
        <div class="info-message">
          No hay gasolineras disponibles actualmente.
        </div>
      `;
      return;
    }

    const stationsHTML = stations.map(station => `
      <div class="station-card">
        <h3>${station.name}</h3>
        <p>${station.address}</p>
        <p>Horario: ${this._formatTime(station.openTime)} - ${this._formatTime(station.closeTime)}</p>
        <button class="btn btn-primary" data-station-id="${station.id}" data-action="request-ticket">
          Solicitar Ticket
        </button>
      </div>
    `).join('');

    container.innerHTML = `
      <h2>Gasolineras Disponibles</h2>
      <div class="stations-grid">
        ${stationsHTML}
      </div>
    `;

    // Event listener para solicitar tickets
    container.querySelectorAll('[data-action="request-ticket"]').forEach(button => {
      button.addEventListener('click', () => {
        const stationId = button.dataset.stationId;
        this.navigateTo('createTicket', { stationId });
      });
    });
  }

  /**
   * Renderiza el formulario de creación de tickets
   * @param {string} stationId - ID de la gasolinera
   */
  async _renderCreateTicketView(stationId) {
    const currentUser = this.getCurrentUser();
    
    if (!currentUser) {
      this.navigateTo('login');
      return;
    }

    try {
      const station = await this.gasStationService.getStationById(stationId);
      
      const template = `
        <div class="ticket-form-container">
          <h2>Solicitar Ticket para ${station.name}</h2>
          <form id="ticket-form">
            <input type="hidden" name="stationId" value="${station.id}">
            <input type="hidden" name="stationName" value="${station.name}">
            
            <div class="form-group">
              <label for="plate">Matrícula del Vehículo</label>
              <input type="text" id="plate" name="plate" required pattern="[A-Z0-9-]{1,10}">
              <small>Formato: letras mayúsculas, números y guiones. Ej: ABC-123</small>
            </div>
            
            <button type="submit" class="btn btn-primary">Solicitar Ticket</button>
            <button type="button" class="btn btn-secondary" data-navigate="dashboard">Cancelar</button>
          </form>
        </div>
      `;
      
      this.rootElement.innerHTML = template;
      
      document.getElementById('ticket-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
          const ticket = await this.ticketService.createTicket({
            ci: currentUser.ci,
            plate: formData.get('plate'),
            stationId: formData.get('stationId'),
            stationName: formData.get('stationName')
          });
          
          this.showNotification('success', `Ticket #${ticket.ticketNumber} creado correctamente`);
          this.navigateTo('myTickets');
        } catch (error) {
          this.showNotification('error', error.message || 'Error al crear ticket');
        }
      });
      
    } catch (error) {
      this.rootElement.innerHTML = `
        <div class="error-container">
          <h2>Error</h2>
          <p>No se pudo cargar la información de la gasolinera</p>
          <button class="btn btn-primary" data-navigate="dashboard">Volver al Dashboard</button>
        </div>
      `;
    }
  }

  /**
   * Renderiza la vista de mis tickets
   */
  async _renderMyTicketsView() {
    const currentUser = this.getCurrentUser();
    
    if (!currentUser) {
      this.navigateTo('login');
      return;
    }

    try {
      const tickets = await this.ticketService.getTicketsByUserCI(currentUser.ci);
      
      if (tickets.length === 0) {
        this.rootElement.innerHTML = `
          <div class="tickets-container">
            <h2>Mis Tickets</h2>
            <div class="info-message">
              No tienes tickets solicitados actualmente.
            </div>
            <button class="btn btn-primary" data-navigate="dashboard">Volver al Dashboard</button>
          </div>
        `;
        return;
      }
      
      const ticketsHTML = tickets.map(ticket => `
        <div class="ticket-card">
          <div class="ticket-header">
            <span class="ticket-number">Ticket #${ticket.ticketNumber}</span>
            <span class="ticket-date">${new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="ticket-body">
            <p><strong>Gasolinera:</strong> ${ticket.stationName}</p>
            <p><strong>Matrícula:</strong> ${ticket.plate}</p>
          </div>
        </div>
      `).join('');
      
      this.rootElement.innerHTML = `
        <div class="tickets-container">
          <h2>Mis Tickets</h2>
          <div class="tickets-list">
            ${ticketsHTML}
          </div>
          <button class="btn btn-primary" data-navigate="dashboard">Volver al Dashboard</button>
        </div>
      `;
      
    } catch (error) {
      this.rootElement.innerHTML = `
        <div class="error-container">
          <h2>Error</h2>
          <p>No se pudieron cargar tus tickets: ${error.message}</p>
          <button class="btn btn-primary" data-navigate="dashboard">Volver al Dashboard</button>
        </div>
      `;
    }
  }

  /**
   * Formatea una fecha para mostrar solo la hora
   * @param {Date|string} dateTime - Fecha a formatear
   * @returns {string} Hora formateada (HH:MM)
   */
  _formatTime(dateTime) {
    const date = new Date(dateTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Renderiza la vista de gestión de estación para administradores
   * @param {Object} station - Datos de la estación
   * @param {HTMLElement} container - Contenedor donde se renderizará
   */
  _renderStationManagement(station, container) {
    container.innerHTML = `
      <div class="station-management">
        <h2>Administrar Gasolinera</h2>
        
        <div class="station-details">
          <h3>${station.name}</h3>
          <p><strong>Número de estación:</strong> ${station.stationNumber}</p>
          <p><strong>Dirección:</strong> ${station.address}</p>
          <p><strong>Horario:</strong> ${this._formatTime(station.openTime)} - ${this._formatTime(station.closeTime)}</p>
        </div>
        
        <div class="management-actions">
          <button class="btn btn-primary" data-action="edit-station">
            Editar Información
          </button>
          <button class="btn btn-secondary" data-view="stationTickets">
            Ver Tickets
          </button>
        </div>
      </div>
    `;
    
    // Event listener para editar estación
    container.querySelector('[data-action="edit-station"]').addEventListener('click', () => {
      this._renderEditStationForm(station, container);
    });
  }

  /**
   * Renderiza el formulario de creación de estación
   * @param {HTMLElement} container - Contenedor donde se renderizará
   */
  _renderCreateStationForm(container) {
    const currentUser = this.getCurrentUser();
    
    container.innerHTML = `
      <div class="station-form">
        <h2>Crear Nueva Gasolinera</h2>
        <form id="create-station-form">
          <div class="form-group">
            <label for="stationNumber">Número de Estación</label>
            <input type="number" id="stationNumber" name="stationNumber" required min="1">
          </div>
          <div class="form-group">
            <label for="name">Nombre</label>
            <input type="text" id="name" name="name" required>
          </div>
          <div class="form-group">
            <label for="address">Dirección</label>
            <input type="text" id="address" name="address" required>
          </div>
          <div class="form-group">
            <label for="openTime">Hora de Apertura</label>
            <input type="time" id="openTime" name="openTime" required>
          </div>
          <div class="form-group">
            <label for="closeTime">Hora de Cierre</label>
            <input type="time" id="closeTime" name="closeTime" required>
          </div>
          <input type="hidden" name="managerCi" value="${currentUser.ci}">
          <button type="submit" class="btn btn-primary">Crear Gasolinera</button>
        </form>
      </div>
    `;
    
    // Event listener para el formulario - Usando el método handleCreateStation
    document.getElementById('create-station-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      // Convertir horas a objetos Date
      const openTime = this._timeStringToDate(formData.get('openTime'));
      const closeTime = this._timeStringToDate(formData.get('closeTime'));
      
      const stationData = {
        stationNumber: formData.get('stationNumber'),
        name: formData.get('name'),
        address: formData.get('address'),
        openTime,
        closeTime,
        managerCi: formData.get('managerCi')
      };
      
      this.handleCreateStation(stationData, container);
    });
  }

  /**
   * Renderiza el formulario de edición de estación
   * @param {Object} station - Datos de la estación
   * @param {HTMLElement} container - Contenedor donde se renderizará
   */
  _renderEditStationForm(station, container) {
    const openTimeStr = this._dateToTimeString(new Date(station.openTime));
    const closeTimeStr = this._dateToTimeString(new Date(station.closeTime));
    
    container.innerHTML = `
      <div class="station-form">
        <h2>Editar Gasolinera</h2>
        <form id="edit-station-form">
          <input type="hidden" name="id" value="${station.id}">
          <div class="form-group">
            <label for="stationNumber">Número de Estación</label>
            <input type="number" id="stationNumber" name="stationNumber" required min="1" value="${station.stationNumber}" readonly>
            <small>El número de estación no se puede modificar</small>
          </div>
          <div class="form-group">
            <label for="name">Nombre</label>
            <input type="text" id="name" name="name" required value="${station.name}">
          </div>
          <div class="form-group">
            <label for="address">Dirección</label>
            <input type="text" id="address" name="address" required value="${station.address}">
          </div>
          <div class="form-group">
            <label for="openTime">Hora de Apertura</label>
            <input type="time" id="openTime" name="openTime" required value="${openTimeStr}">
          </div>
          <div class="form-group">
            <label for="closeTime">Hora de Cierre</label>
            <input type="time" id="closeTime" name="closeTime" required value="${closeTimeStr}">
          </div>
          <button type="submit" class="btn btn-primary">Guardar Cambios</button>
          <button type="button" class="btn btn-secondary" data-action="cancel-edit">Cancelar</button>
        </form>
      </div>
    `;
    
    // Event listener para cancelar edición
    container.querySelector('[data-action="cancel-edit"]').addEventListener('click', () => {
      this._renderStationManagement(station, container);
    });
    
    // Event listener para el formulario
    document.getElementById('edit-station-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      // Convertir horas a objetos Date
      const openTime = this._timeStringToDate(formData.get('openTime'));
      const closeTime = this._timeStringToDate(formData.get('closeTime'));
      
      try {
        const updatedStation = await this.gasStationService.updateStation(formData.get('id'), {
          name: formData.get('name'),
          address: formData.get('address'),
          openTime,
          closeTime
        });
        
        this.showNotification('success', 'Información actualizada correctamente');
        this._renderStationManagement(updatedStation, container);
      } catch (error) {
        this.showNotification('error', error.message || 'Error al actualizar la información');
      }
    });
  }

  /**
   * Renderiza la lista de tickets de una estación
   * @param {Array} tickets - Lista de tickets
   * @param {Object} station - Datos de la estación
   * @param {HTMLElement} container - Contenedor donde se renderizará
   */
  _renderStationTickets(tickets, station, container) {
    if (tickets.length === 0) {
      container.innerHTML = `
        <div class="station-tickets">
          <h2>Tickets de ${station.name}</h2>
          <div class="info-message">
            No hay tickets solicitados actualmente.
          </div>
        </div>
      `;
      return;
    }
    
    const ticketsHTML = tickets.map(ticket => `
      <tr>
        <td>${ticket.ticketNumber}</td>
        <td>${ticket.ci}</td>
        <td>${ticket.plate}</td>
        <td>${new Date(ticket.createdAt).toLocaleString()}</td>
      </tr>
    `).join('');
    
    container.innerHTML = `
      <div class="station-tickets">
        <h2>Tickets de ${station.name}</h2>
        <table class="tickets-table">
          <thead>
            <tr>
              <th>N° Ticket</th>
              <th>CI Usuario</th>
              <th>Matrícula</th>
              <th>Fecha/Hora</th>
            </tr>
          </thead>
          <tbody>
            ${ticketsHTML}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Convierte string de hora a objeto Date
   * @param {string} timeStr - String de hora (HH:MM)
   * @returns {Date} Objeto Date con la hora especificada
   */
  _timeStringToDate(timeStr) {
    const date = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Convierte objeto Date a string de hora (HH:MM)
   * @param {Date} date - Objeto Date
   * @returns {string} String de hora (HH:MM)
   */
  _dateToTimeString(date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  /**
   * Renderiza una vista 404
   */
  _renderNotFoundView() {
    this.rootElement.innerHTML = `
      <div class="not-found-container">
        <h2>Página no encontrada</h2>
        <p>La página que buscas no existe.</p>
        <button class="btn btn-primary" data-navigate="dashboard">Volver al Dashboard</button>
      </div>
    `;
  }
}

module.exports = WebUIAdapter;

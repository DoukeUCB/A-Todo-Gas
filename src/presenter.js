const WebUIAdapter = require("./adapters/primary/web/WebUIAdapter.js");
const UserService = require("./application/services/UserService");
const GasStationService = require("./application/services/GasStationService");
const TicketService = require("./application/services/TicketService");

// Crear instancias de los servicios
const userService = new UserService();
const gasStationService = new GasStationService();
const ticketService = new TicketService();

// Inicializar el adaptador de UI con los servicios necesarios
const webAdapter = new WebUIAdapter(userService, gasStationService, ticketService);

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Inicializar la interfaz con el elemento raíz 'app'
    webAdapter.initialize('app');
    
    // Comprobar si hay un usuario en sesión, si no, redirigir al login
    const currentUser = webAdapter.getCurrentUser();
    if (currentUser) {
      webAdapter.navigateTo('dashboard');
    } else {
      webAdapter.navigateTo('login');
    }
    
    console.log('Aplicación QuickGasoline iniciada correctamente');
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
  }
});

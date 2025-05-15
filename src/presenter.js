const WebUIAdapter = require("./adapters/primary/web/WebUIAdapter.js");
const UserService = require("./application/services/UserService");
const GasStationService = require("./application/services/GasStationService");
const TicketService = require("./application/services/TicketService");

// Exportar la función para inicializar la aplicación en el cliente
function initializeApp(rootElementId) {
  try {
    // Crear instancias de los servicios
    const userService = new UserService();
    const gasStationService = new GasStationService();
    const ticketService = new TicketService();
    
    // Inicializar el adaptador de UI con los servicios necesarios
    const webAdapter = new WebUIAdapter(userService, gasStationService, ticketService);
    
    // Inicializar la interfaz con el elemento raíz proporcionado
    webAdapter.initialize(rootElementId);
    
    // Comprobar si hay un usuario en sesión, si no, redirigir al login
    const currentUser = webAdapter.getCurrentUser();
    if (currentUser) {
      webAdapter.navigateTo('dashboard');
    } else {
      webAdapter.navigateTo('login');
    }
    
    console.log('Aplicación QuickGasoline iniciada correctamente');
    return webAdapter;
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
    throw error;
  }
}

// Exportar los servicios y la función de inicialización
module.exports = {
  WebUIAdapter,
  UserService,
  GasStationService,
  TicketService,
  initializeApp
};

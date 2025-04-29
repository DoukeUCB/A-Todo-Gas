import { registrarGasolineraUseCase } from "./config/di.js";
import { WebUIAdapter } from "./adapters/primary/web/WebUIAdapter.js";

// Inicializar el adaptador de UI con el caso de uso de registro de gasolinera
const webAdapter = new WebUIAdapter(registrarGasolineraUseCase);

// Iniciar la aplicación cuando el DOM haya cargado
document.addEventListener('DOMContentLoaded', () => {
  webAdapter.init();
});

import { realizarSumaUseCase } from "./config/di";
import { WebUIAdapter } from "./adapters/primary/web/WebUIAdapter";

// Inicializar el adaptador de UI con el caso de uso
const webAdapter = new WebUIAdapter(realizarSumaUseCase);
// Iniciar la aplicación
webAdapter.init();

// Módulo básico para el presentador
const presenter = {
  init: () => {
    console.log('Inicializando interfaz de usuario');
  }
};

module.exports = presenter;

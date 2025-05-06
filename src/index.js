import { WebUIAdapter } from './adapters/primary/web/WebUIAdapter.js';

// Inicializar la interfaz cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando la aplicación cliente...');
  const webAdapter = new WebUIAdapter();
  webAdapter.init();
});

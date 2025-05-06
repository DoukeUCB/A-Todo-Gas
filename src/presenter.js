import { getDependencias } from "./config/di.js";
import { WebUIAdapter } from "./adapters/primary/web/WebUIAdapter.js";

// Asegurarnos de que las dependencias estén inicializadas
document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM cargado, inicializando la aplicación...");
  
  try {
    // Esperamos a que las dependencias estén inicializadas
    console.log("Esperando inicialización de dependencias...");
    const { success, registrarGasolineraUseCase, error } = await getDependencias();
    
    if (!success) {
      console.error(`Error al inicializar dependencias: ${error}`);
      const mensajeEl = document.getElementById("mensaje-resultado");
      if (mensajeEl) {
        mensajeEl.textContent = `Error: No se pudo conectar a la base de datos. ${error}`;
        mensajeEl.className = "mensaje error";
      }
      return;
    }
    
    console.log("Dependencias inicializadas correctamente, creando adaptador UI");
    
    // Inicializar el adaptador de UI con el caso de uso de registro de gasolinera
    const webAdapter = new WebUIAdapter(registrarGasolineraUseCase);
    webAdapter.init();
  } catch (error) {
    console.error("Error al inicializar la aplicación:", error);
    const mensajeEl = document.getElementById("mensaje-resultado");
    if (mensajeEl) {
      mensajeEl.textContent = "Error: No se pudo inicializar la aplicación. Por favor, recarga la página.";
      mensajeEl.className = "mensaje error";
    }
  }
});

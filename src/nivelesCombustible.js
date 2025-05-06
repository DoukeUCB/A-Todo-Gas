import { registrarNivelCombustibleUseCase, obtenerHistorialNivelesUseCase } from "./config/di.js";
import { NivelesCombustibleUIAdapter } from "./adapters/primary/web/NivelesCombustibleUIAdapter.js";

// Inicializar el adaptador de UI con los casos de uso
document.addEventListener('DOMContentLoaded', () => {
  const adapter = new NivelesCombustibleUIAdapter(
    registrarNivelCombustibleUseCase, 
    obtenerHistorialNivelesUseCase
  );
  adapter.init();
  console.log('Módulo de niveles de combustible inicializado');
});

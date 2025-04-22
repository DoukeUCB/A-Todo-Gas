import { PersistenciaOutputPort } from "../../../application/ports/output/PersistenciaOutputPort";

// Adaptador secundario que implementa la persistencia usando localStorage
export class LocalStorageAdapter extends PersistenciaOutputPort {
  guardarResultado(operacion, resultado) {
    const historial = this.obtenerHistorial();
    historial.push({ 
      operacion: operacion, 
      resultado: resultado, 
      fecha: new Date().toISOString() 
    });
    localStorage.setItem('calculadora-historial', JSON.stringify(historial));
    return true;
  }
  
  obtenerHistorial() {
    const historial = localStorage.getItem('calculadora-historial');
    return historial ? JSON.parse(historial) : [];
  }
}

// Puerto secundario para persistencia
export class PersistenciaOutputPort {
  guardarResultado(operacion, resultado) {
    throw new Error("Este método debe ser implementado por un adaptador secundario");
  }
  
  obtenerHistorial() {
    throw new Error("Este método debe ser implementado por un adaptador secundario");
  }
}

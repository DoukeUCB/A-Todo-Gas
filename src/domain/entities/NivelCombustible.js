export class NivelCombustible {
  constructor(dispenserId, percentage, id = null, recordedAt = new Date()) {
    this.id = id;
    this.dispenserId = dispenserId;
    this.percentage = percentage;
    this.recordedAt = recordedAt;
  }

  validate() {
    if (this.percentage < 0 || this.percentage > 100) {
      throw new Error("El porcentaje debe estar entre 0 y 100");
    }
    
    if (!this.dispenserId) {
      throw new Error("Se requiere un ID de surtidor válido");
    }
    
    return true;
  }
}

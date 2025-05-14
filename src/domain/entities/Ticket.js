class Ticket {
  constructor({ id, ci, plate, ticketNumber, stationId, stationName, createdAt }) {
    this.id = id;
    this.ci = ci;
    this.plate = plate;
    this.ticketNumber = typeof ticketNumber === 'string' ? parseInt(ticketNumber) : ticketNumber;
    this.stationId = stationId;
    this.stationName = stationName;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt || Date.now());
    
    this.validate();
  }

  validate() {
    if (!this.ci || !/^[0-9]+$/.test(this.ci)) {
      throw new Error('El CI es requerido y debe contener solo números');
    }
    
    if (!this.plate || !/^[A-Z0-9-]{1,10}$/.test(this.plate)) {
      throw new Error('La matrícula es requerida y debe tener formato válido (letras mayúsculas, números y guiones)');
    }
    
    if (!this.ticketNumber || this.ticketNumber < 1) {
      throw new Error('El número de ticket es requerido y debe ser mayor a 0');
    }
    
    if (!this.stationId) {
      throw new Error('El ID de la estación es requerido');
    }
    
    if (!this.stationName || typeof this.stationName !== 'string') {
      throw new Error('El nombre de la estación es requerido');
    }
    
    if (!(this.createdAt instanceof Date) || isNaN(this.createdAt)) {
      throw new Error('La fecha de creación debe ser válida');
    }
  }
}

module.exports = Ticket;

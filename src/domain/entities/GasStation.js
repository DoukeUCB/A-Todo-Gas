class GasStation {
  constructor({ id, stationNumber, name, address, openTime, closeTime, managerCi }) {
    this.id = id;
    this.stationNumber = typeof stationNumber === 'string' ? parseInt(stationNumber) : stationNumber;
    this.name = name;
    this.address = address;
    this.openTime = openTime instanceof Date ? openTime : new Date(openTime);
    this.closeTime = closeTime instanceof Date ? closeTime : new Date(closeTime);
    this.managerCi = managerCi;
    
    this.validate();
  }

  validate() {
    if (!this.stationNumber || this.stationNumber < 1) {
      throw new Error('El número de estación es requerido y debe ser mayor a 0');
    }
    
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('El nombre de la estación es requerido');
    }
    
    if (!this.address || typeof this.address !== 'string') {
      throw new Error('La dirección es requerida');
    }
    
    if (!(this.openTime instanceof Date) || isNaN(this.openTime)) {
      throw new Error('La hora de apertura debe ser una fecha válida');
    }
    
    if (!(this.closeTime instanceof Date) || isNaN(this.closeTime)) {
      throw new Error('La hora de cierre debe ser una fecha válida');
    }
    
    if (this.closeTime <= this.openTime) {
      throw new Error('La hora de cierre debe ser posterior a la hora de apertura');
    }
    
    if (!this.managerCi || !/^[0-9]+$/.test(this.managerCi)) {
      throw new Error('El CI del administrador es requerido y debe contener solo números');
    }
  }
}

module.exports = GasStation;

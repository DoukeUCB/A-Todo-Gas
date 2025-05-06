class VisualizarDisponibilidad {
  constructor() {
    this.gasStations = [];
  }

  getGasStations() {
    return this.gasStations;
  }

  addGasStation(gasStation) {
    if (!gasStation.id || !gasStation.name || typeof gasStation.available !== 'boolean') {
      throw new Error('Gas station must have an id, name, and availability status');
    }
    this.gasStations.push(gasStation);
  }
  getAvailableGasStations() {
    return this.gasStations.filter(station => station.available);
  }
}

module.exports = VisualizarDisponibilidad;
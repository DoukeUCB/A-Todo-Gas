const VisualizarDisponibilidad = require('../../../src/domain/entities/VisualizarDisponibilidad');

// VisualizarDisponibilidad.test.js

describe('HU-03/Sprint-01 Visualizar Disponibilidad de Gasolineras', () => {
  let visualizarDisponibilidad;

  beforeEach(() => {
    visualizarDisponibilidad = new VisualizarDisponibilidad();
  });

  it('Debería inicializarse con una lista vacía de gasolineras.', () => {
    expect(visualizarDisponibilidad.getGasStations()).toEqual([]);
  });
  it('Permitir agregar una gasolinera con detalles de disponibilidad', () => {
    const gasStation = { id: 1, name: 'Station 1', available: true };
    visualizarDisponibilidad.addGasStation(gasStation);
    expect(visualizarDisponibilidad.getGasStations()).toContainEqual(gasStation);
  });
  it('Validar campos obligatorios al agregar una gasolinera', () => {
    const invalidGasStation = { name: 'Station 3' }; // Missing 'id' and 'available'
    expect(() => visualizarDisponibilidad.addGasStation(invalidGasStation)).toThrow(
      'Gas station must have an id, name, and availability status'
    );
  });
  it(' Filtrar gasolineras por disponibilidad', () => {
    const gasStations = [
      { id: 1, name: 'Station 1', available: true },
      { id: 2, name: 'Station 2', available: false },
    ];
    gasStations.forEach(station => visualizarDisponibilidad.addGasStation(station));
  
    const availableStations = visualizarDisponibilidad.getAvailableGasStations();
    expect(availableStations).toEqual([{ id: 1, name: 'Station 1', available: true }]);
  });

});
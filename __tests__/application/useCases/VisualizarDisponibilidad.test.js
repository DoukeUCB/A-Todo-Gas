const VisualizarDisponibilidad = require('../../../src/domain/entities/VisualizarDisponibilidad');

// VisualizarDisponibilidad.test.js

describe('HU-03/Sprint-01 Visualizar Disponibilidad de Gasolineras', () => {
  let visualizarDisponibilidad;

  beforeEach(() => {
    visualizarDisponibilidad = new VisualizarDisponibilidad();
  });

  test('Debería inicializarse con una lista vacía de gasolineras.', () => {
    expect(visualizarDisponibilidad.getGasStations()).toEqual([]);
  });
  test('Permitir agregar una gasolinera con detalles de disponibilidad', () => {
    const gasStation = { id: 1, name: 'Station 1', available: true };
    visualizarDisponibilidad.addGasStation(gasStation);
    expect(visualizarDisponibilidad.getGasStations()).toContainEqual(gasStation);
  });

});
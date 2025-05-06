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

});
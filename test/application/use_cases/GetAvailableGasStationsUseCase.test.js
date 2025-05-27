const GetAvailableGasStationsUseCase = require('../../../src/application/use_cases/GetAvailableGasStationsUseCase');
const GasStation = require('../../../src/domain/entities/GasStation');

describe('GetAvailableGasStationsUseCase', () => {
  // Datos de prueba
  const mockStations = [
    new GasStation({
      id: '1',
      stationNumber: 1,
      name: 'Estación Disponible 1',
      address: 'Dirección 1',
      openTime: new Date(),
      closeTime: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hora después
      managerCi: '12345678',
      currentLevel: 1000, // Tiene combustible
      available: true
    }),
    new GasStation({
      id: '2',
      stationNumber: 2,
      name: 'Estación Disponible 2',
      address: 'Dirección 2',
      openTime: new Date(),
      closeTime: new Date(new Date().getTime() + 60 * 60 * 1000),
      managerCi: '23456789',
      currentLevel: 500, // Tiene combustible
      available: true
    }),
    new GasStation({
      id: '3',
      stationNumber: 3,
      name: 'Estación Sin Combustible',
      address: 'Dirección 3',
      openTime: new Date(),
      closeTime: new Date(new Date().getTime() + 60 * 60 * 1000),
      managerCi: '34567890',
      currentLevel: 0, // Sin combustible
      available: false
    }),
    new GasStation({
      id: '4',
      stationNumber: 4,
      name: 'Estación Con Combustible pero No Disponible',
      address: 'Dirección 4',
      openTime: new Date(),
      closeTime: new Date(new Date().getTime() + 60 * 60 * 1000),
      managerCi: '45678901',
      currentLevel: 200, // Tiene combustible
      available: false // Pero no está disponible
    })
  ];

  // Mock del repositorio de gasolineras
  const mockGasStationRepository = {
    findAll: jest.fn().mockResolvedValue(mockStations)
  };

  let getAvailableGasStationsUseCase;

  beforeEach(() => {
    getAvailableGasStationsUseCase = new GetAvailableGasStationsUseCase(mockGasStationRepository);
    jest.clearAllMocks();
  });

  test('debería retornar solo las gasolineras disponibles con combustible', async () => {
    // Ejecutar el caso de uso
    const availableStations = await getAvailableGasStationsUseCase.execute();
    
    // Verificar que se llamó al método findAll del repositorio
    expect(mockGasStationRepository.findAll).toHaveBeenCalled();
    
    // Verificar que solo se retornaron las estaciones disponibles
    expect(availableStations.length).toBe(2);
    expect(availableStations[0].id).toBe('1');
    expect(availableStations[1].id).toBe('2');
    
    // Verificar que todas tienen combustible y están disponibles
    availableStations.forEach(station => {
      expect(station.currentLevel).toBeGreaterThan(0);
      expect(station.available).toBe(true);
    });
  });

  test('debería retornar un array vacío si no hay gasolineras disponibles', async () => {
    // Mock que retorna gasolineras sin combustible o no disponibles
    const emptyMockRepository = {
      findAll: jest.fn().mockResolvedValue([mockStations[2], mockStations[3]])
    };
    
    const useCase = new GetAvailableGasStationsUseCase(emptyMockRepository);
    
    // Ejecutar el caso de uso
    const availableStations = await useCase.execute();
    
    // Verificar que no hay estaciones disponibles
    expect(availableStations.length).toBe(0);
  });
});

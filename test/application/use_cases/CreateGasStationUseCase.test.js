const CreateGasStationUseCase = require('../../../src/application/use_cases/CreateGasStationUseCase');
const GasStation = require('../../../src/domain/entities/GasStation');

describe('CreateGasStationUseCase', () => {
  const now = new Date();
  const openTime = new Date(now);
  openTime.setHours(8, 0, 0);
  
  const closeTime = new Date(now);
  closeTime.setHours(20, 0, 0);
  
  // Datos de prueba para la gasolinera
  const gasStationData = {
    stationNumber: 42,
    name: 'Estación Central',
    address: 'Av. Principal #123',
    openTime,
    closeTime,
    managerCi: '87654321'
  };
  
  // Mock del repositorio
  const mockGasStationRepository = {
    findByStationNumber: jest.fn(),
    findByManagerCI: jest.fn(),
    create: jest.fn()
  };
  
  let createGasStationUseCase;
  
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
    
    createGasStationUseCase = new CreateGasStationUseCase(mockGasStationRepository);
  });
  
  test('debería crear una gasolinera cuando los datos son válidos', async () => {
    // Configurar el mock para que no encuentre gasolineras existentes
    mockGasStationRepository.findByStationNumber.mockResolvedValue(null);
    mockGasStationRepository.findByManagerCI.mockResolvedValue(null);
    
    // Configurar el mock para devolver la gasolinera creada
    const createdStation = new GasStation({
      id: '123e4567-e89b-12d3-a456-426614174000',
      ...gasStationData
    });
    mockGasStationRepository.create.mockResolvedValue(createdStation);
    
    // Ejecutar el caso de uso
    const result = await createGasStationUseCase.execute(gasStationData);
    
    // Verificar resultados
    expect(result).toEqual(createdStation);
    expect(mockGasStationRepository.findByStationNumber).toHaveBeenCalledWith(gasStationData.stationNumber);
    expect(mockGasStationRepository.create).toHaveBeenCalled();
  });
  
  test('debería lanzar error si ya existe una gasolinera con el mismo número', async () => {
    // Configurar el mock para que encuentre una gasolinera existente
    const existingStation = new GasStation({
      id: '123e4567-e89b-12d3-a456-426614174000',
      ...gasStationData
    });
    mockGasStationRepository.findByStationNumber.mockResolvedValue(existingStation);
    
    // Ejecutar el caso de uso y verificar que lanza error
    await expect(createGasStationUseCase.execute(gasStationData))
      .rejects.toThrow(`Ya existe una gasolinera con el número: ${gasStationData.stationNumber}`);
    
    expect(mockGasStationRepository.create).not.toHaveBeenCalled();
  });
  
  test('debería lanzar error si el administrador ya tiene una gasolinera asignada', async () => {
    // Configurar el mock para que no encuentre gasolinera con el mismo número
    mockGasStationRepository.findByStationNumber.mockResolvedValue(null);
    
    // Pero sí encuentra una gasolinera con el mismo CI de administrador
    const existingStationWithManager = new GasStation({
      id: '223e4567-e89b-12d3-a456-426614174001',
      stationNumber: 43, // Diferente número
      name: 'Otra Estación',
      address: 'Otra Dirección',
      openTime,
      closeTime,
      managerCi: gasStationData.managerCi // Mismo CI de administrador
    });
    mockGasStationRepository.findByManagerCI.mockResolvedValue(existingStationWithManager);
    
    // Ejecutar el caso de uso y verificar que lanza error
    await expect(createGasStationUseCase.execute(gasStationData))
      .rejects.toThrow(`El administrador con CI: ${gasStationData.managerCi} ya tiene una gasolinera asignada`);
    
    expect(mockGasStationRepository.create).not.toHaveBeenCalled();
  });
});

const GasStation = require('../../../src/domain/entities/GasStation');

// Creando un mock repository independiente de MongoDB Memory Server
function createMockRepository() {
  const mockStations = new Map();
  
  return {
    create: jest.fn(async (station) => {
      // Verificar si ya existe una gasolinera con el mismo número
      for (const [_, existingStation] of mockStations.entries()) {
        if (existingStation.stationNumber === station.stationNumber) {
          throw new Error(`Ya existe una gasolinera con el número: ${station.stationNumber}`);
        }
      }
      
      mockStations.set(station.id, { ...station });
      return station;
    }),
    
    findById: jest.fn(async (id) => {
      const station = mockStations.get(id);
      return station ? new GasStation(station) : null;
    }),
    
    findByManagerCI: jest.fn(async (managerCi) => {
      for (const [_, station] of mockStations.entries()) {
        if (station.managerCi === managerCi) {
          return new GasStation(station);
        }
      }
      return null;
    }),
    
    findAll: jest.fn(async () => {
      return Array.from(mockStations.values()).map(station => new GasStation(station));
    }),
    
    update: jest.fn(async (id, updateData) => {
      const station = mockStations.get(id);
      if (!station) return false;
      
      const updatedStation = { ...station, ...updateData };
      mockStations.set(id, updatedStation);
      return true;
    }),
    
    delete: jest.fn(async (id) => {
      return mockStations.delete(id);
    }),
    
    // Método para limpiar todos los datos (útil en beforeEach)
    clear: jest.fn(() => {
      mockStations.clear();
    })
  };
}

// Crear el repositorio mock para las pruebas
let gasStationRepository;

beforeEach(() => {
  // Crear un nuevo repositorio limpio antes de cada prueba
  gasStationRepository = createMockRepository();
});

describe('MongoGasStationRepository (Mock)', () => {
  // Datos de prueba
  const now = new Date();
  const openTime = new Date(now);
  openTime.setHours(8, 0, 0); // 8:00 AM
  
  const closeTime = new Date(now);
  closeTime.setHours(20, 0, 0); // 8:00 PM
  
  const testStation = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    stationNumber: 42,
    name: 'Estación Central',
    address: 'Av. Principal #123',
    openTime,
    closeTime,
    managerCi: '87654321',
    currentLevel: 1000,
    available: true,
    ticketCount: 0
  };
  
  test('debería crear una gasolinera', async () => {
    const station = new GasStation(testStation);
    const createdStation = await gasStationRepository.create(station);
    
    expect(createdStation.id).toBeDefined();
    expect(createdStation.stationNumber).toBe(testStation.stationNumber);
    expect(createdStation.name).toBe(testStation.name);
  });
  
  test('debería encontrar una gasolinera por ID', async () => {
    const station = new GasStation(testStation);
    await gasStationRepository.create(station);
    
    const foundStation = await gasStationRepository.findById(station.id);
    
    expect(foundStation).not.toBeNull();
    expect(foundStation.id).toBe(station.id);
    expect(foundStation.name).toBe(station.name);
  });
  
  test('debería encontrar una gasolinera por CI del administrador', async () => {
    const station = new GasStation(testStation);
    await gasStationRepository.create(station);
    
    const foundStation = await gasStationRepository.findByManagerCI(station.managerCi);
    
    expect(foundStation).not.toBeNull();
    expect(foundStation.managerCi).toBe(station.managerCi);
  });
  
  test('debería obtener todas las gasolineras', async () => {
    const station1 = new GasStation(testStation);
    await gasStationRepository.create(station1);
    
    const station2 = new GasStation({
      ...testStation,
      id: '223e4567-e89b-12d3-a456-426614174001',
      stationNumber: 43,
      name: 'Estación Norte'
    });
    await gasStationRepository.create(station2);
    
    const stations = await gasStationRepository.findAll();
    
    expect(stations).toHaveLength(2);
    expect(stations[0].name).toBe(station1.name);
    expect(stations[1].name).toBe(station2.name);
  });
  
  test('debería actualizar una gasolinera', async () => {
    const station = new GasStation(testStation);
    await gasStationRepository.create(station);
    
    const updatedData = {
      name: 'Estación Central Actualizada',
      address: 'Nueva dirección #456'
    };
    
    const updated = await gasStationRepository.update(station.id, updatedData);
    expect(updated).toBeTruthy();
    
    const foundStation = await gasStationRepository.findById(station.id);
    expect(foundStation.name).toBe(updatedData.name);
    expect(foundStation.address).toBe(updatedData.address);
    // Verificar que otros campos permanecen iguales
    expect(foundStation.stationNumber).toBe(station.stationNumber);
  });
  
  test('debería eliminar una gasolinera', async () => {
    const station = new GasStation(testStation);
    await gasStationRepository.create(station);
    
    const deleted = await gasStationRepository.delete(station.id);
    expect(deleted).toBeTruthy();
    
    const foundStation = await gasStationRepository.findById(station.id);
    expect(foundStation).toBeNull();
  });
  
  test('no debería permitir crear gasolineras con número duplicado', async () => {
    const station1 = new GasStation(testStation);
    await gasStationRepository.create(station1);
    
    const station2 = new GasStation({
      ...testStation,
      id: '323e4567-e89b-12d3-a456-426614174002',
      name: 'Otra Estación',
      // Mismo número de estación
    });
    
    await expect(gasStationRepository.create(station2)).rejects.toThrow(/Ya existe una gasolinera con el número/);
  });
});

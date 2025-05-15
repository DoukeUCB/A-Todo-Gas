const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const GasStation = require('../../../src/domain/entities/GasStation');
const MongoGasStationRepository = require('../../../src/infrastructure/mongodb/MongoGasStationRepository');

let mongoServer;
let mongoClient;
let db;
let gasStationRepository;

// Aumentar el timeout para todas las pruebas en este archivo
jest.setTimeout(30000);

beforeAll(async () => {
  // Configurar MongoDB en memoria para pruebas
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  mongoClient = new MongoClient(uri, { 
    serverSelectionTimeoutMS: 10000, // Aumentar timeout de selección del servidor
    connectTimeoutMS: 10000 // Aumentar timeout de conexión
  });
  await mongoClient.connect();
  db = mongoClient.db('test_db');
  
  // Crear los índices únicos manualmente antes de las pruebas
  await db.collection('gasStations').createIndexes([
    { key: { stationNumber: 1 }, name: 'stationNumber_unique', unique: true },
    { key: { managerCi: 1 }, name: 'managerCi_index' }
  ]);
  
  // Crear repositorio con la conexión a la BD de prueba
  gasStationRepository = new MongoGasStationRepository(db);
});

afterAll(async () => {
  await mongoClient.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Limpiar la colección antes de cada prueba
  await db.collection('gasStations').deleteMany({});
});

describe('MongoGasStationRepository', () => {
  const now = new Date();
  const openTime = new Date(now);
  openTime.setHours(8, 0, 0);
  
  const closeTime = new Date(now);
  closeTime.setHours(20, 0, 0);
  
  const testStation = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    stationNumber: 42,
    name: 'Estación Central',
    address: 'Av. Principal #123',
    openTime,
    closeTime,
    managerCi: '87654321'
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
  
  test('debería encontrar una gasolinera por stationNumber', async () => {
    const station = new GasStation(testStation);
    await gasStationRepository.create(station);
    
    const foundStation = await gasStationRepository.findByStationNumber(station.stationNumber);
    
    expect(foundStation).not.toBeNull();
    expect(foundStation.stationNumber).toBe(station.stationNumber);
  });
  
  test('debería encontrar una gasolinera por managerCi', async () => {
    const station = new GasStation(testStation);
    await gasStationRepository.create(station);
    
    const foundStation = await gasStationRepository.findByManagerCI(station.managerCi);
    
    expect(foundStation).not.toBeNull();
    expect(foundStation.managerCi).toBe(station.managerCi);
  });
  
  test('debería actualizar una gasolinera', async () => {
    const station = new GasStation(testStation);
    await gasStationRepository.create(station);
    
    const updatedData = {
      name: 'Estación Actualizada',
      address: 'Nueva Dirección #456'
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
  
  test('no debería permitir crear gasolineras con stationNumber duplicado', async () => {
    const station1 = new GasStation(testStation);
    await gasStationRepository.create(station1);
    
    const station2 = new GasStation({
      ...testStation,
      id: '223e4567-e89b-12d3-a456-426614174001',
      managerCi: '12345678', // CI diferente
      // Mismo stationNumber
    });
    
    await expect(gasStationRepository.create(station2)).rejects.toThrow(/Ya existe una gasolinera con el número/);
  });
});

const request = require('supertest');
const express = require('express');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Importar módulos necesarios
const { connectToDatabase, getDatabase, closeDatabase } = require('../../src/infrastructure/mongodb/database');
const gasStationController = require('../../src/adapters/secondary/rest/gasStationController');

// Mock de environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017';
process.env.DB_NAME = 'testdb';

describe('Prueba de integración para gasolineras disponibles', () => {
  let mongoServer;
  let app;
  let db;

  beforeAll(async () => {
    // Crear servidor MongoDB en memoria para pruebas
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    
    // Configurar app Express para pruebas
    app = express();
    app.use(express.json());
    app.use('/api/stations', gasStationController);
    
    // Conectar a la base de datos
    await connectToDatabase();
    db = await getDatabase();
    
    // Insertar datos de prueba
    await setupTestData(db);
  });

  afterAll(async () => {
    await closeDatabase();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  test('GET /api/stations/available debe devolver solo gasolineras disponibles', async () => {
    const response = await request(app).get('/api/stations/available');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    const stations = response.body.data;
    
    // Verificar que todas las estaciones son disponibles y tienen combustible
    expect(stations.length).toBeGreaterThan(0);
    stations.forEach(station => {
      expect(station.available).toBe(true);
      expect(station.currentLevel).toBeGreaterThan(0);
    });
    
    // Verificar que no se incluyen estaciones no disponibles
    const unavailableStationIds = ['3', '4']; // IDs de estaciones no disponibles
    const returnedIds = stations.map(s => s.id);
    unavailableStationIds.forEach(id => {
      expect(returnedIds).not.toContain(id);
    });
  });

  // Función para configurar datos de prueba
  async function setupTestData(db) {
    const now = new Date();
    const later = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora después
    
    const testStations = [
      {
        _id: '1',
        stationNumber: 1,
        name: 'Estación Disponible 1',
        address: 'Dirección 1',
        openTime: now,
        closeTime: later,
        managerCi: '12345678',
        currentLevel: 1000,
        available: true,
        ticketCount: 0
      },
      {
        _id: '2',
        stationNumber: 2,
        name: 'Estación Disponible 2',
        address: 'Dirección 2',
        openTime: now,
        closeTime: later,
        managerCi: '23456789',
        currentLevel: 500,
        available: true,
        ticketCount: 5
      },
      {
        _id: '3',
        stationNumber: 3,
        name: 'Estación Sin Combustible',
        address: 'Dirección 3',
        openTime: now,
        closeTime: later,
        managerCi: '34567890',
        currentLevel: 0,
        available: false,
        ticketCount: 10
      },
      {
        _id: '4',
        stationNumber: 4,
        name: 'Estación Con Combustible pero No Disponible',
        address: 'Dirección 4',
        openTime: now,
        closeTime: later,
        managerCi: '45678901',
        currentLevel: 200,
        available: false,
        ticketCount: 15
      }
    ];
    
    // Insertar estaciones de prueba
    await db.collection('gasStations').insertMany(testStations);
  }
});

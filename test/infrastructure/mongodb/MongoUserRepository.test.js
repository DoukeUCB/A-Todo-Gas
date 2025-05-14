const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const User = require('../../../src/domain/entities/User');
const MongoUserRepository = require('../../../src/infrastructure/mongodb/MongoUserRepository');

let mongoServer;
let mongoClient;
let db;
let userRepository;

beforeAll(async () => {
  // Configurar MongoDB en memoria para pruebas
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  db = mongoClient.db('test_db');
  
  // Crear los índices únicos manualmente antes de las pruebas
  await db.collection('users').createIndexes([
    { key: { ci: 1 }, name: 'ci_unique', unique: true },
    { key: { email: 1 }, name: 'email_unique', unique: true }
  ]);
  
  // Crear repositorio con la conexión a la BD de prueba
  userRepository = new MongoUserRepository(db);
});

afterAll(async () => {
  await mongoClient.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Limpiar la colección antes de cada prueba
  await db.collection('users').deleteMany({});
});

describe('MongoUserRepository', () => {
  const testUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    fullName: 'Juan Pérez',
    ci: '12345678',
    email: 'juan@example.com',
    phone: '79123456',
    password: 'hashedpassword123',
    role: 'conductor'
  };
  
  test('debería crear un usuario', async () => {
    const user = new User(testUser);
    const createdUser = await userRepository.create(user);
    
    expect(createdUser.id).toBeDefined();
    expect(createdUser.fullName).toBe(testUser.fullName);
    expect(createdUser.ci).toBe(testUser.ci);
  });
  
  test('debería encontrar un usuario por ID', async () => {
    const user = new User(testUser);
    await userRepository.create(user);
    
    const foundUser = await userRepository.findById(user.id);
    
    expect(foundUser).not.toBeNull();
    expect(foundUser.id).toBe(user.id);
    expect(foundUser.fullName).toBe(user.fullName);
  });
  
  test('debería encontrar un usuario por CI', async () => {
    const user = new User(testUser);
    await userRepository.create(user);
    
    const foundUser = await userRepository.findByCI(user.ci);
    
    expect(foundUser).not.toBeNull();
    expect(foundUser.ci).toBe(user.ci);
  });
  
  test('debería actualizar un usuario', async () => {
    const user = new User(testUser);
    await userRepository.create(user);
    
    const updatedData = {
      fullName: 'Juan Pérez Actualizado',
      phone: '79654321'
    };
    
    const updated = await userRepository.update(user.id, updatedData);
    expect(updated).toBeTruthy();
    
    const foundUser = await userRepository.findById(user.id);
    expect(foundUser.fullName).toBe(updatedData.fullName);
    expect(foundUser.phone).toBe(updatedData.phone);
    // Verificar que otros campos permanecen iguales
    expect(foundUser.ci).toBe(user.ci);
  });
  
  test('debería eliminar un usuario', async () => {
    const user = new User(testUser);
    await userRepository.create(user);
    
    const deleted = await userRepository.delete(user.id);
    expect(deleted).toBeTruthy();
    
    const foundUser = await userRepository.findById(user.id);
    expect(foundUser).toBeNull();
  });
  
  test('no debería permitir crear usuarios con CI duplicado', async () => {
    const user1 = new User(testUser);
    await userRepository.create(user1);
    
    const user2 = new User({
      ...testUser,
      id: '223e4567-e89b-12d3-a456-426614174001',
      email: 'otro@example.com' // Email diferente
      // CI igual
    });
    
    // Cambiar la expectativa para que coincida con el mensaje de error real
    await expect(userRepository.create(user2)).rejects.toThrow(/Ya existe un usuario con el CI/);
  });
});

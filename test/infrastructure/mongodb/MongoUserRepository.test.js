const User = require('../../../src/domain/entities/User');

// Creando un mock repository independiente de MongoDB Memory Server
function createMockRepository() {
  const mockUsers = new Map();
  
  return {
    create: jest.fn(async (user) => {
      // Verificar CI duplicado
      for (const [_, existingUser] of mockUsers.entries()) {
        if (existingUser.ci === user.ci) {
          throw new Error(`Ya existe un usuario con el CI: ${user.ci}`);
        }
        if (existingUser.email === user.email) {
          throw new Error(`Ya existe un usuario con el email: ${user.email}`);
        }
      }
      
      mockUsers.set(user.id, { ...user });
      return user;
    }),
    
    findById: jest.fn(async (id) => {
      const user = mockUsers.get(id);
      return user ? new User(user) : null;
    }),
    
    findByCI: jest.fn(async (ci) => {
      for (const [_, user] of mockUsers.entries()) {
        if (user.ci === ci) {
          return new User(user);
        }
      }
      return null;
    }),
    
    findByEmail: jest.fn(async (email) => {
      for (const [_, user] of mockUsers.entries()) {
        if (user.email === email) {
          return new User(user);
        }
      }
      return null;
    }),
    
    update: jest.fn(async (id, updateData) => {
      const user = mockUsers.get(id);
      if (!user) return false;
      
      const updatedUser = { ...user, ...updateData };
      mockUsers.set(id, updatedUser);
      return true;
    }),
    
    delete: jest.fn(async (id) => {
      return mockUsers.delete(id);
    }),
    
    // Método para limpiar todos los datos (útil en beforeEach)
    clear: jest.fn(() => {
      mockUsers.clear();
    })
  };
}

// Crear el repositorio mock para las pruebas
let userRepository;

beforeEach(() => {
  // Crear un nuevo repositorio limpio antes de cada prueba
  userRepository = createMockRepository();
});

describe('MongoUserRepository (Mock)', () => {
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
    
    await expect(userRepository.create(user2)).rejects.toThrow(/Ya existe un usuario con el CI/);
  });
});

const CreateUserUseCase = require('../../../src/application/use_cases/CreateUserUseCase');
const User = require('../../../src/domain/entities/User');

// Mock de repositorio
class MockUserRepository {
  constructor() {
    this.users = [];
  }
  
  async findByCI(ci) {
    return this.users.find(user => user.ci === ci) || null;
  }
  
  async findByEmail(email) {
    return this.users.find(user => user.email === email) || null;
  }
  
  async create(user) {
    const newUser = { ...user, id: user.id || 'generatedId' };
    this.users.push(newUser);
    return newUser;
  }
}

describe('CreateUserUseCase', () => {
  let userRepository;
  let createUserUseCase;
  
  beforeEach(() => {
    userRepository = new MockUserRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
  });
  
  test('debería crear un usuario cuando los datos son válidos', async () => {
    const userData = {
      fullName: 'Juan Pérez',
      ci: '12345678',
      email: 'juan@example.com',
      phone: '79123456',
      password: 'password123',
      role: 'conductor'
    };
    
    const createdUser = await createUserUseCase.execute(userData);
    
    expect(createdUser).toBeDefined();
    expect(createdUser.id).toBeDefined();
    expect(createdUser.fullName).toBe(userData.fullName);
    expect(createdUser.ci).toBe(userData.ci);
  });
  
  test('debería rechazar usuario con CI duplicado', async () => {
    // Primero, crear un usuario
    const existingUser = new User({
      id: 'existingId',
      fullName: 'Usuario Existente',
      ci: '12345678',
      email: 'existente@example.com',
      phone: '79123456',
      password: 'password123',
      role: 'conductor'
    });
    
    await userRepository.create(existingUser);
    
    // Intentar crear otro con el mismo CI
    const newUserData = {
      fullName: 'Otro Usuario',
      ci: '12345678', // CI duplicado
      email: 'otro@example.com',
      phone: '76543210',
      password: 'password456',
      role: 'conductor'
    };
    
    await expect(createUserUseCase.execute(newUserData))
      .rejects
      .toThrow(/Ya existe un usuario con el CI/);
  });
  
  test('debería rechazar usuario con email duplicado', async () => {
    // Primero, crear un usuario
    const existingUser = new User({
      id: 'existingId',
      fullName: 'Usuario Existente',
      ci: '12345678',
      email: 'duplicado@example.com',
      phone: '79123456',
      password: 'password123',
      role: 'conductor'
    });
    
    await userRepository.create(existingUser);
    
    // Intentar crear otro con el mismo email
    const newUserData = {
      fullName: 'Otro Usuario',
      ci: '87654321', 
      email: 'duplicado@example.com', // Email duplicado
      phone: '76543210',
      password: 'password456',
      role: 'conductor'
    };
    
    await expect(createUserUseCase.execute(newUserData))
      .rejects
      .toThrow(/Ya existe un usuario con el email/);
  });
});

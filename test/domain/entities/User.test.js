const User = require('../../../src/domain/entities/User');

describe('User Entity', () => {
  test('debería crear un usuario válido', () => {
    const userData = {
      id: '123456',
      fullName: 'Juan Pérez',
      ci: '12345678',
      email: 'juan@example.com',
      phone: '79123456',
      password: 'password123',
      role: 'conductor'
    };
    
    const user = new User(userData);
    
    expect(user).toMatchObject(userData);
  });
  
  test('debería lanzar error con CI inválido', () => {
    const userData = {
      id: '123456',
      fullName: 'Juan Pérez',
      ci: '12345A78', // CI inválido con una letra
      email: 'juan@example.com',
      phone: '79123456',
      password: 'password123',
      role: 'conductor'
    };
    
    expect(() => new User(userData)).toThrow(/CI es requerido/);
  });
  
  test('debería lanzar error con correo inválido', () => {
    const userData = {
      id: '123456',
      fullName: 'Juan Pérez',
      ci: '12345678',
      email: 'juanexample.com', // Falta @
      phone: '79123456',
      password: 'password123',
      role: 'conductor'
    };
    
    expect(() => new User(userData)).toThrow(/correo electrónico/);
  });
  
  test('debería lanzar error con rol inválido', () => {
    const userData = {
      id: '123456',
      fullName: 'Juan Pérez',
      ci: '12345678',
      email: 'juan@example.com',
      phone: '79123456',
      password: 'password123',
      role: 'admin' // Rol no permitido
    };
    
    expect(() => new User(userData)).toThrow(/rol debe ser/);
  });
});

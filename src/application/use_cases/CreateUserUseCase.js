const User = require('../../domain/entities/User');
const { v4: uuidv4 } = require('uuid');

class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  
  async execute(userData) {
    try {
      console.log('Ejecutando CreateUserUseCase con datos:', {
        ...userData,
        password: userData.password ? '********' : undefined
      });
      
      // Verificar si ya existe un usuario con el mismo CI o email
      const existingUserByCI = await this.userRepository.findByCI(userData.ci);
      if (existingUserByCI) {
        throw new Error(`Ya existe un usuario con el CI: ${userData.ci}`);
      }
      
      const existingUserByEmail = await this.userRepository.findByEmail(userData.email);
      if (existingUserByEmail) {
        throw new Error(`Ya existe un usuario con el email: ${userData.email}`);
      }
      
      // Generar un UUID para el usuario
      const userId = uuidv4();
      console.log(`Generado UUID para nuevo usuario: ${userId}`);
      
      // Crear entidad de dominio con el ID generado
      const userWithId = {
        ...userData,
        id: userId
      };
      
      const user = new User(userWithId);
      
      // Persistir el usuario
      return await this.userRepository.create(user);
    } catch (error) {
      console.error('Error en CreateUserUseCase:', error);
      throw error;
    }
  }
}

module.exports = CreateUserUseCase;

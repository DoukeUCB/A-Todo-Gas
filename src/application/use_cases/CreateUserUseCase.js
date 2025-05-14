const User = require('../../domain/entities/User');

class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  
  async execute(userData) {
    // Verificar si ya existe un usuario con el mismo CI o email
    const existingUserByCI = await this.userRepository.findByCI(userData.ci);
    if (existingUserByCI) {
      throw new Error(`Ya existe un usuario con el CI: ${userData.ci}`);
    }
    
    const existingUserByEmail = await this.userRepository.findByEmail(userData.email);
    if (existingUserByEmail) {
      throw new Error(`Ya existe un usuario con el email: ${userData.email}`);
    }
    
    // Crear entidad de dominio
    const user = new User(userData);
    
    // Persistir el usuario
    return this.userRepository.create(user);
  }
}

module.exports = CreateUserUseCase;

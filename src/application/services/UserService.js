const CreateUserUseCase = require('../use_cases/CreateUserUseCase');
const MongoUserRepository = require('../../infrastructure/mongodb/MongoUserRepository');
const { getDatabase } = require('../../infrastructure/mongodb/database');
const bcrypt = require('bcrypt');

class UserService {
  constructor() {
    this.userRepository = null;
    this.createUserUseCase = null;
    this._initPromise = null;
  }
  
  /**
   * Inicializa el servicio asegurándose de que la base de datos esté disponible
   * @returns {Promise<void>}
   */
  async initialize() {
    if (!this._initPromise) {
      this._initPromise = this._init();
    }
    return this._initPromise;
  }
  
  /**
   * Inicializa internamente el repositorio y los casos de uso
   * @private
   */
  async _init() {
    try {
      const db = await getDatabase();
      this.userRepository = new MongoUserRepository(db);
      this.createUserUseCase = new CreateUserUseCase(this.userRepository);
    } catch (error) {
      console.error('Error al inicializar UserService:', error);
      throw error;
    }
  }
  
  async register(userData) {
    await this.initialize();
    try {
      // Hashear la contraseña antes de guardarla
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userWithHashedPassword = {
        ...userData,
        password: hashedPassword
      };
      
      return await this.createUserUseCase.execute(userWithHashedPassword);
    } catch (error) {
      throw error;
    }
  }
  
  async login(ci, password) {
    await this.initialize();
    try {
      const user = await this.userRepository.findByCI(ci);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new Error('Contraseña incorrecta');
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  }
  
  async getUserById(id) {
    await this.initialize();
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
  
  async updateUser(id, updateData) {
    await this.initialize();
    try {
      // Si se está actualizando la contraseña, hashearla
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      
      const success = await this.userRepository.update(id, updateData);
      if (!success) {
        throw new Error('No se pudo actualizar el usuario');
      }
      
      return await this.userRepository.findById(id);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;

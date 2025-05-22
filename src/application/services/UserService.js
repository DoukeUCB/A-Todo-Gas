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
      console.log(`Intentando login con CI: "${ci}" (${typeof ci})`);
      
      // Si CI es numérico pero viene como string, intentar convertirlo
      const ciToUse = ci.toString();
      
      // Intentar encontrar el usuario
      const user = await this.userRepository.findByCI(ciToUse);
      console.log('Resultado de búsqueda de usuario:', user ? 'encontrado' : 'no encontrado');
      
      // Depurar la estructura del usuario encontrado
      if (user) {
        console.log('Datos del usuario encontrado:', {
          id: user.id,
          fullName: user.fullName,
          ci: user.ci,
          email: user.email,
          role: user.role,
        });
      }
      
      if (!user) {
        // Intentar un diagnóstico más profundo
        console.log('Diagnóstico de base de datos:');
        try {
          // Verificar si hay usuarios en la colección
          const db = await getDatabase();
          const userCount = await db.collection('users').countDocuments();
          console.log(`Total de usuarios en la base de datos: ${userCount}`);
          
          // Mostrar una muestra de usuarios para diagnóstico
          if (userCount > 0) {
            const sampleUsers = await db.collection('users')
              .find({}, { projection: { ci: 1, email: 1, _id: 1 } })
              .limit(5)
              .toArray();
            
            console.log('Muestra de usuarios existentes:', 
              sampleUsers.map(u => ({id: u._id, ci: u.ci, email: u.email})));
          }
        } catch (diagError) {
          console.error('Error en el diagnóstico:', diagError);
        }
        
        throw new Error('Usuario no encontrado');
      }
      
      // Verificar la contraseña
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new Error('Contraseña incorrecta');
      }
      
      console.log(`Login exitoso para usuario ${user.fullName} (${user.id})`);
      return user;
    } catch (error) {
      console.error('Error en el login:', error);
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

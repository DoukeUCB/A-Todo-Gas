const { v4: uuidv4 } = require('uuid');

class MongoUserRepository {
  constructor(db) {
    if (!db) {
      throw new Error('Se requiere una instancia de base de datos para MongoUserRepository');
    }
    this.collection = db.collection('users');
    console.log('MongoUserRepository inicializado con colección:', this.collection.collectionName);
  }

  /**
   * Mapea un documento de MongoDB a un objeto de dominio
   * @private
   * @param {Object} doc - Documento de MongoDB
   * @returns {Object|null} Objeto de dominio o null si doc es null
   */
  _mapToEntity(doc) {
    if (!doc) return null;
    
    // Preservamos _id como una referencia para debugging, pero principalmente usamos id como identificador
    return {
      id: doc._id,     // El ID principal usado por el dominio
      _id: doc._id,    // Mantener referencia al _id original para casos de depuración
      fullName: doc.fullName,
      ci: doc.ci,
      email: doc.email,
      phone: doc.phone,
      password: doc.password,
      role: doc.role
    };
  }

  /**
   * Encuentra un usuario por su CI
   * @param {string} ci - Carnet de identidad
   * @returns {Promise<Object|null>} Usuario encontrado o null si no existe
   */
  async findByCI(ci) {
    try {
      console.log(`Buscando usuario con CI: "${ci}" (${typeof ci})`);
      
      // Asegurar que el CI sea string para la búsqueda
      const ciStr = ci.toString();
      
      const user = await this.collection.findOne({ ci: ciStr });
      
      if (user) {
        console.log(`Usuario encontrado con CI: ${ciStr}, ID: ${user._id}`);
        // Devolver objeto con id mapeado desde _id
        return this._mapToEntity(user);
      } else {
        console.log(`No se encontró usuario con CI: ${ciStr}`);
        return null;
      }
    } catch (error) {
      console.error(`Error buscando usuario por CI ${ci}:`, error);
      throw error;
    }
  }

  /**
   * Encuentra un usuario por su email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null si no existe
   */
  async findByEmail(email) {
    try {
      const user = await this.collection.findOne({ email });
      return this._mapToEntity(user);
    } catch (error) {
      console.error(`Error buscando usuario por email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Encuentra un usuario por su ID
   * @param {string} id - ID del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null si no existe
   */
  async findById(id) {
    try {
      // Buscar directamente por _id (string)
      const user = await this.collection.findOne({ _id: id });
      return this._mapToEntity(user);
    } catch (error) {
      console.error(`Error buscando usuario por ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} user - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async create(user) {
    try {
      // Generar UUID si no existe
      const userId = user.id || uuidv4();
      
      // Crear documento para MongoDB
      const userDoc = {
        _id: userId,
        fullName: user.fullName,
        ci: user.ci,
        email: user.email,
        phone: user.phone,
        password: user.password,
        role: user.role
      };
      
      const result = await this.collection.insertOne(userDoc);
      console.log(`Usuario creado con ID: ${userId}`);
      
      // Retornar el usuario con el id asignado (como objeto de dominio)
      return this._mapToEntity(userDoc);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza un usuario existente
   * @param {string} id - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<boolean>} True si la actualización fue exitosa
   */
  async update(id, updateData) {
    try {
      const result = await this.collection.updateOne(
        { _id: id },
        { $set: updateData }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error(`Error actualizando usuario con ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = MongoUserRepository;

const { v4: uuidv4 } = require('uuid');
const IUserRepository = require('../../domain/repositories/IUserRepository');
const User = require('../../domain/entities/User');

class MongoUserRepository extends IUserRepository {
  constructor(db) {
    super();
    this.db = db;
    this.collection = db.collection('users');
  }
  
  async findById(id) {
    const userData = await this.collection.findOne({ _id: id });
    if (!userData) return null;
    
    return new User({
      id: userData._id,
      fullName: userData.fullName,
      ci: userData.ci,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: userData.role
    });
  }
  
  async findByCI(ci) {
    const userData = await this.collection.findOne({ ci });
    if (!userData) return null;
    
    return new User({
      id: userData._id,
      fullName: userData.fullName,
      ci: userData.ci,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: userData.role
    });
  }
  
  async findByEmail(email) {
    const userData = await this.collection.findOne({ email });
    if (!userData) return null;
    
    return new User({
      id: userData._id,
      fullName: userData.fullName,
      ci: userData.ci,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: userData.role
    });
  }
  
  async create(user) {
    const id = user.id || uuidv4();
    
    const userToInsert = {
      _id: id,
      fullName: user.fullName,
      ci: user.ci,
      email: user.email,
      phone: user.phone,
      password: user.password,
      role: user.role
    };
    
    try {
      // Verificar manualmente si ya existe un usuario con el mismo CI o email
      const duplicateCI = await this.collection.findOne({ ci: user.ci });
      if (duplicateCI) {
        throw new Error(`Ya existe un usuario con el CI: ${user.ci}`);
      }
      
      const duplicateEmail = await this.collection.findOne({ email: user.email });
      if (duplicateEmail) {
        throw new Error(`Ya existe un usuario con el email: ${user.email}`);
      }
      
      await this.collection.insertOne(userToInsert);
      return new User({ id, ...user });
    } catch (error) {
      // Manejo adicional para errores de MongoDB
      if (error.code === 11000) {
        // Error de MongoDB para clave duplicada
        const field = error.message.includes('ci') ? 'CI' : 'email';
        throw new Error(`Ya existe un usuario con el mismo ${field}`);
      }
      throw error;
    }
  }
  
  async update(id, userData) {
    try {
      const result = await this.collection.updateOne(
        { _id: id },
        { $set: userData }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Ya existe un usuario con el mismo CI o email');
      }
      throw error;
    }
  }
  
  async delete(id) {
    const result = await this.collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}

module.exports = MongoUserRepository;

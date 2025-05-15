const User = require('../../domain/entities/User');
const { v4: uuidv4 } = require('uuid');

class MongoUserRepository {
  constructor(db) {
    this.collection = db.collection('users');
  }

  async create(user) {
    // Si no tiene ID, generamos uno
    if (!user.id) {
      user.id = uuidv4();
    }

    // Verificar si ya existe un usuario con el mismo CI o email
    const existingUserCI = await this.findByCI(user.ci);
    if (existingUserCI) {
      throw new Error(`Ya existe un usuario con el CI: ${user.ci}`);
    }

    const existingUserEmail = await this.findByEmail(user.email);
    if (existingUserEmail) {
      throw new Error(`Ya existe un usuario con el email: ${user.email}`);
    }

    // Convertir la entidad a documento MongoDB
    const userDoc = this._toMongoDocument(user);

    try {
      await this.collection.insertOne(userDoc);
      return user;
    } catch (error) {
      if (error.code === 11000) { // Error de clave duplicada
        if (error.keyPattern.ci) {
          throw new Error(`Ya existe un usuario con el CI: ${user.ci}`);
        }
        if (error.keyPattern.email) {
          throw new Error(`Ya existe un usuario con el email: ${user.email}`);
        }
      }
      throw error;
    }
  }

  async findById(id) {
    const userDoc = await this.collection.findOne({ _id: id });
    return userDoc ? this._toEntity(userDoc) : null;
  }

  async findByCI(ci) {
    const userDoc = await this.collection.findOne({ ci });
    return userDoc ? this._toEntity(userDoc) : null;
  }

  async findByEmail(email) {
    const userDoc = await this.collection.findOne({ email });
    return userDoc ? this._toEntity(userDoc) : null;
  }

  async update(id, updateData) {
    const updateDoc = {};
    
    // Solo permitir actualizar ciertos campos
    if (updateData.fullName !== undefined) updateDoc.fullName = updateData.fullName;
    if (updateData.phone !== undefined) updateDoc.phone = updateData.phone;
    if (updateData.password !== undefined) updateDoc.password = updateData.password;
    
    // No permitir actualizar CI, email o role por seguridad

    const result = await this.collection.updateOne(
      { _id: id },
      { $set: updateDoc }
    );

    return result.modifiedCount > 0;
  }

  async delete(id) {
    const result = await this.collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  // Convierte un documento MongoDB a entidad de dominio
  _toEntity(doc) {
    return new User({
      id: doc._id,
      fullName: doc.fullName,
      ci: doc.ci,
      email: doc.email,
      phone: doc.phone,
      password: doc.password,
      role: doc.role
    });
  }

  // Convierte una entidad de dominio a documento MongoDB
  _toMongoDocument(user) {
    return {
      _id: user.id,
      fullName: user.fullName,
      ci: user.ci,
      email: user.email,
      phone: user.phone,
      password: user.password,
      role: user.role
    };
  }
}

module.exports = MongoUserRepository;

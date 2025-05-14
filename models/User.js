const { v4: uuidv4 } = require('uuid');
const database = require('../db/connection');

class User {
  static async getCollection() {
    const db = await database.connect();
    return db.collection('users');
  }

  static async findById(id) {
    const collection = await this.getCollection();
    return collection.findOne({ _id: id });
  }

  static async findByCI(ci) {
    const collection = await this.getCollection();
    return collection.findOne({ ci });
  }

  static async findByEmail(email) {
    const collection = await this.getCollection();
    return collection.findOne({ email });
  }

  static async create(userData) {
    const collection = await this.getCollection();
    const user = {
      _id: uuidv4(),
      ...userData
    };
    await collection.insertOne(user);
    return user;
  }

  static async update(id, userData) {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { _id: id },
      { $set: userData }
    );
    return result.modifiedCount > 0;
  }

  static async delete(id) {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}

module.exports = User;

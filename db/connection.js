const { MongoClient } = require('mongodb');
const config = require('../config/database');

class Database {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    if (this.client) return this.db;

    try {
      this.client = await MongoClient.connect(config.MONGODB_URI);
      this.db = this.client.db(config.DB_NAME);
      console.log('Conexión exitosa a MongoDB Atlas');
      return this.db;
    } catch (error) {
      console.error('Error al conectarse a MongoDB Atlas:', error);
      throw error;
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Conexión a MongoDB cerrada');
    }
  }

  getDb() {
    if (!this.db) {
      throw new Error('No hay conexión activa a la base de datos. Llame a connect() primero.');
    }
    return this.db;
  }
}

// Singleton instance
const database = new Database();
module.exports = database;

const { MongoClient } = require('mongodb');

let client = null;
let database = null;

/**
 * Conecta a la base de datos MongoDB
 * @returns {Promise<Object>} Instancia de la base de datos
 */
async function connectToDatabase() {
  if (database) return database;
  
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickGasoline_db';
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    await client.connect();
    console.log('Conectado a MongoDB');
    
    database = client.db();
    return database;
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    throw error;
  }
}

/**
 * Obtiene la instancia de la base de datos
 * @returns {Promise<Object>} Instancia de la base de datos
 */
async function getDatabase() {
  if (!database) {
    return connectToDatabase();
  }
  return database;
}

/**
 * Cierra la conexión a la base de datos
 */
async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    database = null;
    console.log('Conexión a MongoDB cerrada');
  }
}

module.exports = {
  connectToDatabase,
  getDatabase,
  closeDatabase
};

const { MongoClient } = require('mongodb');

// Variables para mantener la conexión
let client;
let database;

/**
 * Establece la conexión con MongoDB
 */
async function connectToDatabase() {
  try {
    // Verificar si ya existe una conexión
    if (client && database) {
      console.log('Reutilizando conexión a MongoDB existente');
      return database;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('Variable de entorno MONGODB_URI no definida');
    }

    // Opciones de conexión
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // Conectar al servidor de MongoDB
    client = new MongoClient(uri, options);
    await client.connect();
    
    // Obtener referencia a la base de datos
    const dbName = process.env.MONGODB_DB_NAME || 'quickGasoline_db';
    database = client.db(dbName);
    
    console.log(`Conectado a la base de datos: ${dbName}`);
    
    return database;
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error);
    throw error;
  }
}

/**
 * Obtiene la instancia de la base de datos
 */
function getDatabase() {
  if (!database) {
    throw new Error('La conexión a la base de datos no ha sido inicializada. Llame a connectToDatabase() primero.');
  }
  return database;
}

/**
 * Cierra la conexión con la base de datos
 */
async function closeDatabase() {
  if (client) {
    await client.close();
    console.log('Conexión a MongoDB cerrada');
    client = null;
    database = null;
  }
}

module.exports = {
  connectToDatabase,
  getDatabase,
  closeDatabase
};

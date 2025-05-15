const { MongoClient } = require('mongodb');

let db = null;
let client = null;
// Promesa que se resolverá cuando la base de datos esté lista
let dbInitPromise = null;

/**
 * Conecta a la base de datos MongoDB
 * @returns {Promise<Db>} Instancia de la base de datos
 */
async function connectToDatabase() {
  if (dbInitPromise) return dbInitPromise;
  
  dbInitPromise = new Promise(async (resolve, reject) => {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickGasoline_db';
      console.log(`Intentando conectar a MongoDB: ${uri}`);
      
      client = new MongoClient(uri, { 
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000
      });
      
      await client.connect();
      
      const dbName = process.env.NODE_ENV === 'test' ? 'quickGasoline_test' : 'quickGasoline_db';
      db = client.db(dbName);
      
      console.log(`Conectado a MongoDB: ${dbName}`);
      resolve(db);
    } catch (error) {
      console.error('Error al conectar a MongoDB:', error);
      reject(error);
    }
  });
  
  return dbInitPromise;
}

/**
 * Obtiene la instancia de la base de datos
 * @returns {Promise<Db>} Promesa que se resuelve con la instancia de la base de datos
 */
async function getDatabase() {
  if (!dbInitPromise) {
    // Iniciar conexión si aún no se ha hecho
    return connectToDatabase();
  }
  return dbInitPromise;
}

/**
 * Verifica si la base de datos está inicializada
 * @returns {boolean} Verdadero si la base de datos está inicializada
 */
function isDatabaseInitialized() {
  return db !== null;
}

/**
 * Cierra la conexión a la base de datos
 */
async function closeDatabase() {
  if (client) {
    await client.close();
    db = null;
    client = null;
    dbInitPromise = null;
    console.log('Conexión a MongoDB cerrada');
  }
}

module.exports = {
  connectToDatabase,
  getDatabase,
  isDatabaseInitialized,
  closeDatabase
};

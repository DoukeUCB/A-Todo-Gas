const { MongoClient } = require('mongodb');

// Variables para el cliente y la base de datos
let client;
let db;

// Función para conectarse a la base de datos
async function connectToDatabase() {
  try {
    console.log('Intentando conectar a MongoDB...');
    
    // Si ya tenemos una conexión, la usamos
    if (client && client.topology && client.topology.isConnected()) {
      console.log('Usando conexión MongoDB existente');
      return db;
    }
    
    // Verificar si tenemos las variables de entorno necesarias
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME;
    
    if (!uri) {
      throw new Error('La variable de entorno MONGODB_URI no está definida');
    }
    
    if (!dbName) {
      throw new Error('La variable de entorno DB_NAME no está definida');
    }
    
    console.log(`Conectando a MongoDB: ${uri.substring(0, uri.indexOf('@'))+'...'}/${dbName}`);
    
    // Crear cliente con opciones mejoradas
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    
    // Establecer conexión
    await client.connect();
    console.log('✅ Conexión establecida con MongoDB');
    
    // Obtener referencia a la base de datos
    db = client.db(dbName);
    console.log(`✅ Base de datos seleccionada: ${dbName}`);
    
    // Verificar que podamos acceder a las colecciones
    const collections = await db.listCollections().toArray();
    console.log(`Colecciones disponibles: ${collections.map(c => c.name).join(', ')}`);
    
    return db;
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error.message);
    throw error;
  }
}

// Función para obtener la base de datos
async function getDatabase() {
  if (!db) {
    await connectToDatabase();
  }
  return db;
}

// Función para cerrar la conexión
async function closeDatabase() {
  if (client) {
    await client.close();
    console.log('Conexión MongoDB cerrada');
  }
}

module.exports = { connectToDatabase, getDatabase, closeDatabase };

const database = require('./db/connection');

async function testConnection() {
  try {
    const db = await database.connect();
    console.log('Conexión exitosa a la base de datos:', db.databaseName);
    
    // Listar colecciones disponibles
    const collections = await db.listCollections().toArray();
    console.log('Colecciones disponibles:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    await database.close();
  } catch (error) {
    console.error('Error en la prueba de conexión:', error);
  }
}

testConnection();

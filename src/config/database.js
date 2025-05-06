import mysql from 'mysql2/promise';

// Configuración de conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Password',
  database: process.env.DB_NAME || 'quickGasonline_db',
};

console.log('Configuración de base de datos:', { 
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
});

// Pool de conexiones para reutilización
let pool;

export const getConnection = async () => {
  if (!pool) {
    try {
      console.log('Intentando crear pool de conexiones a MySQL...');
      pool = mysql.createPool(dbConfig);
      
      // Verificar la conexión
      console.log('Verificando conexión a la base de datos...');
      const connection = await pool.getConnection();
      console.log('Conexión a la base de datos establecida correctamente');
      connection.release();
      
      // Verificar si las tablas existen
      await checkTablesExist(pool);
    } catch (error) {
      console.error('Error al crear el pool de conexiones:', error);
      throw error;
    }
  }
  return pool;
};

// Función para verificar si las tablas necesarias existen
async function checkTablesExist(pool) {
  try {
    // Verificar si la tabla stations existe
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'stations'
    `, [dbConfig.database]);
    
    if (tables.length === 0) {
      console.error('¡ALERTA! La tabla "stations" no existe en la base de datos.');
      console.log('Asegúrate de que las tablas han sido creadas correctamente.');
    } else {
      console.log('Tabla "stations" encontrada en la base de datos.');
    }
  } catch (error) {
    console.error('Error al verificar tablas:', error);
  }
}

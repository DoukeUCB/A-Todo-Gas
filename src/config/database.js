import mysql from 'mysql2/promise';

// Configuración de conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'quickGasonline_db',
};

// Pool de conexiones para reutilización
let pool;

export const getConnection = async () => {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
    } catch (error) {
      console.error('Error al crear el pool de conexiones:', error);
      throw error;
    }
  }
  return pool;
};

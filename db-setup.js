import mysql from 'mysql2/promise';

// Configuración de conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Password',
  database: process.env.DB_NAME || 'quickGasonline_db',
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('Conectando a MySQL...');
    // Primero conectamos sin especificar la base de datos para poder crearla
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    // Crear base de datos si no existe
    console.log(`Verificando si existe la base de datos '${dbConfig.database}'...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`Base de datos '${dbConfig.database}' disponible.`);
    
    // Usar la base de datos
    await connection.query(`USE ${dbConfig.database}`);
    
    // Crear tabla de usuarios si no existe
    console.log('Creando tabla users si no existe...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('cliente','gasolinera') NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      )
    `);
    
    // Crear tabla de gasolineras si no existe
    console.log('Creando tabla stations si no existe...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stations (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id INT UNSIGNED NOT NULL,
        name VARCHAR(150) NOT NULL,
        address TEXT NOT NULL,
        open_time TIME NOT NULL,
        close_time TIME NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_stations_user (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Crear un usuario de prueba si no existe ninguno
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      console.log('Creando usuario de prueba...');
      await connection.query(`
        INSERT INTO users (name, email, password_hash, role)
        VALUES ('Usuario Prueba', 'test@example.com', '$2a$10$dV4QRJIOxtsH/ZupejMzPuwFnAYXMyo5xw7H7rnoQzIJFjEFGxg8.', 'gasolinera')
      `);
      console.log('Usuario de prueba creado con ID 1');
      console.log('Credenciales de prueba: email=test@example.com, password=password');
    } else {
      console.log(`Ya existen ${users[0].count} usuarios en la base de datos.`);
    }
    
    console.log('¡Configuración de base de datos completada con éxito!');
    
  } catch (error) {
    console.error('Error al configurar la base de datos:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión a la base de datos cerrada.');
    }
  }
}

// Ejecutar la configuración
setupDatabase();

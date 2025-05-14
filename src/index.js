// Este archivo será el punto de entrada para la aplicación
require('dotenv').config();
const { MongoClient } = require('mongodb');
const config = require('../config/database');

// Cambiamos de import a require
const presenter = require('./presenter');

// Punto de entrada de la aplicación
async function startApp() {
  console.log('Iniciando aplicación QuickGasoline...');
  
  try {
    // Conectar a la base de datos
    const client = await MongoClient.connect(config.MONGODB_URI);
    const db = client.db(config.DB_NAME);
    
    console.log('Conexión establecida con MongoDB Atlas');
    
    // Aquí irá la inicialización de la aplicación
    // - Configuración de dependencias
    // - Inicialización de controladores/adaptadores
    // - Inicialización de API/servidor web
    
    console.log('Aplicación QuickGasoline ejecutándose');
    
    // Manejar cierre de la aplicación
    process.on('SIGINT', async () => {
      console.log('Cerrando conexión a la base de datos...');
      await client.close();
      console.log('Conexión cerrada. Saliendo.');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}

// Ejecutar la aplicación
startApp();

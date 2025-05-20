// Punto de entrada para el despliegue de la API en Render
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDatabase, closeDatabase } = require('./src/infrastructure/mongodb/database');

// Punto de entrada de la aplicación del servidor para API
async function startServer() {
  console.log('Iniciando servicio de API QuickGasoline...');
  
  try {
    // Conectar a la base de datos antes de configurar el servidor
    await connectToDatabase();
    console.log('Conexión establecida con MongoDB Atlas');
    
    // Configurar el servidor Express
    const app = express();
    const port = process.env.PORT || 10000;
    
    // Configurar CORS para permitir solicitudes desde Netlify
    app.use(cors({
      origin: ['https://quickgasoline.netlify.app', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true
    }));
    
    // Middleware para parsear JSON
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Ruta raíz para verificar que la API está activa
    app.get('/', (req, res) => {
      res.json({ 
        status: 'ok', 
        message: 'API QuickGasoline funcionando correctamente' 
      });
    });
    
    // Configurar rutas API
    const userController = require('./src/adapters/secondary/rest/userController');
    app.use('/api/users', userController);
    
    const gasStationController = require('./src/adapters/secondary/rest/gasStationController');
    app.use('/api/stations', gasStationController);
    
    // Crear un controlador de tickets si no existe
    const ticketController = require('./src/adapters/secondary/rest/ticketController');
    app.use('/api/tickets', ticketController);
    
    // Ruta de prueba simple para verificar que la API funciona
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'API funcionando correctamente' });
    });
    
    // Iniciar el servidor
    const server = app.listen(port, () => {
      console.log(`Servidor API QuickGasoline iniciado en puerto ${port}`);
    });
    
    // Manejar cierre de la aplicación
    process.on('SIGINT', async () => {
      console.log('Cerrando API...');
      await closeDatabase();
      await new Promise((resolve) => server.close(resolve));
      console.log('Conexiones cerradas. Saliendo.');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error al iniciar el servidor de API:', error);
    process.exit(1);
  }
}

// Ejecutar el servidor
startServer();
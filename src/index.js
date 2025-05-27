// Este archivo será el punto de entrada para la aplicación del servidor
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { connectToDatabase, closeDatabase } = require('./infrastructure/mongodb/database');

// Punto de entrada de la aplicación del servidor
async function startApp() {
  console.log('Iniciando aplicación QuickGasoline...');
  
  try {
    // Conectar a la base de datos antes de configurar el servidor
    await connectToDatabase();
    console.log('Conexión establecida con MongoDB Atlas');
    
    // Configurar el servidor Express de forma minimalista
    const app = express();
    const port = process.env.PORT || 3000;
    
    // Configurar CORS para permitir solicitudes desde Netlify
    app.use(cors({
      origin: function(origin, callback) {
        // Permitir solicitudes sin origen (como las aplicaciones móviles o Postman)
        if (!origin) return callback(null, true);
        
        // Lista de orígenes permitidos
        const allowedOrigins = [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'https://quickgasoline.netlify.app',
          'https://quickgasoline.netlify.com'
        ];
        
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          console.warn(`Origen no permitido: ${origin}`);
          callback(null, true); // Permitir de todos modos pero con advertencia
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
    }));
    
    // Middleware básico
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Servir archivos estáticos - esto maneja automáticamente los archivos HTML, CSS, JS, etc.
    app.use(express.static(path.join(__dirname, '../public')));
    
    // Configurar rutas API
    const userController = require('./adapters/secondary/rest/userController');
    app.use('/api/users', userController);
    
    // Configurar controlador de gasolineras
    const gasStationController = require('./adapters/secondary/rest/gasStationController');
    app.use('/api/stations', gasStationController);
    
    // Configurar controlador de tickets
    const ticketController = require('./adapters/secondary/rest/ticketController');
    app.use('/api/tickets', ticketController);
    
    // Ruta de prueba simple para verificar que la API funciona
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'API funcionando correctamente', env: process.env.NODE_ENV });
    });
    
    // Iniciar el servidor
    const server = app.listen(port, () => {
      console.log(`Servidor QuickGasoline iniciado en http://localhost:${port} (${process.env.NODE_ENV})`);
    });
    
    // Manejar cierre de la aplicación
    process.on('SIGINT', async () => {
      console.log('Cerrando aplicación...');
      await closeDatabase();
      await new Promise((resolve) => server.close(resolve));
      console.log('Conexiones cerradas. Saliendo.');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}

// Ejecutar la aplicación
startApp();

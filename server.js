// Punto de entrada para el despliegue del backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDatabase, closeDatabase } = require('./src/infrastructure/mongodb/database');

async function startServer() {
  console.log('Iniciando servidor backend de QuickGasoline...');
  
  try {
    // Conectar a la base de datos
    await connectToDatabase();
    console.log('Conexión establecida con MongoDB Atlas');
    
    // Configurar servidor Express
    const app = express();
    const port = process.env.PORT || 8000;
    
    // Configurar CORS para permitir solicitudes desde el frontend
    const allowedOrigins = [
      'https://quickgasoline.netlify.app', // URL de producción en Netlify
      'http://localhost:3000', // URL local para desarrollo
    ];
    
    app.use(cors({
      origin: function(origin, callback) {
        // Permitir solicitudes sin origen (como las de herramientas de API)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
          const msg = 'El origen CORS no está permitido';
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
      credentials: true
    }));
    
    // Middleware para parsear JSON
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Ruta básica
    app.get('/', (req, res) => {
      res.json({ 
        message: 'API de QuickGasoline funcionando correctamente',
        version: '1.0.0'
      });
    });
    
    // Configurar rutas API
    const userController = require('./src/adapters/secondary/rest/userController');
    app.use('/api/users', userController);
    
    const gasStationController = require('./src/adapters/secondary/rest/gasStationController');
    app.use('/api/stations', gasStationController);
    
    const ticketController = require('./src/adapters/secondary/rest/ticketController');
    app.use('/api/tickets', ticketController);
    
    // Ruta de verificación de estado
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'API funcionando correctamente' });
    });
    
    // Iniciar el servidor
    const server = app.listen(port, () => {
      console.log(`Servidor backend QuickGasoline iniciado en http://localhost:${port}`);
    });
    
    // Manejar cierre gracioso
    process.on('SIGINT', async () => {
      console.log('Cerrando aplicación...');
      await closeDatabase();
      await new Promise((resolve) => server.close(resolve));
      console.log('Conexiones cerradas. Saliendo.');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error al iniciar el servidor backend:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();

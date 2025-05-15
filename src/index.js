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
    
    // Middleware básico
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Servir archivos estáticos - esto maneja automáticamente los archivos HTML, CSS, JS, etc.
    app.use(express.static(path.join(__dirname, '../public')));
    
    // Configurar rutas API
    const userController = require('./adapters/secondary/rest/userController');
    app.use('/api/users', userController);
    
    // Ruta de prueba simple para verificar que la API funciona
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'API funcionando correctamente' });
    });
    
    // Iniciar el servidor
    const server = app.listen(port, () => {
      console.log(`Servidor QuickGasoline iniciado en http://localhost:${port}`);
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

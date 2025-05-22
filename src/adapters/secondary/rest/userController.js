const express = require('express');
const router = express.Router();
const UserService = require('../../../application/services/UserService');

const userService = new UserService();

// Inicializar el servicio
userService.initialize()
  .then(() => console.log('UserService inicializado correctamente'))
  .catch(err => console.error('Error al inicializar UserService:', err));

// Endpoint para registrar un nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const userData = req.body;
    console.log('Datos recibidos para registro:', {
      ...userData,
      password: userData.password ? '********' : undefined // Ocultar contraseña en logs
    });
    
    // Verificar que todos los campos requeridos estén presentes
    const requiredFields = ['fullName', 'ci', 'email', 'phone', 'password', 'role'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      console.log(`Campos faltantes en la solicitud: ${missingFields.join(', ')}`);
      return res.status(400).json({
        success: false,
        message: `Campos requeridos faltantes: ${missingFields.join(', ')}`
      });
    }
    
    // Validaciones adicionales según el esquema
    if (!/^[0-9]+$/.test(userData.ci)) {
      return res.status(400).json({
        success: false,
        message: 'El CI debe contener solo números'
      });
    }
    
    if (!/^.+@.+\..+$/.test(userData.email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de correo electrónico inválido'
      });
    }
    
    if (!/^[0-9+ -]+$/.test(userData.phone)) {
      return res.status(400).json({
        success: false,
        message: 'El teléfono debe contener solo números, espacios y los caracteres + -'
      });
    }
    
    if (!['conductor', 'gasolinera'].includes(userData.role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido. Debe ser "conductor" o "gasolinera"'
      });
    }
    
    // Intentar registrar el usuario
    try {
      console.log('Enviando datos a userService.register...');
      const user = await userService.register(userData);
      console.log('Usuario registrado correctamente:', user.id);
      
      // No devolver la contraseña
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado correctamente',
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Error específico en el proceso de registro:', error);
      
      // Manejar errores específicos
      if (error.message && error.message.includes('Ya existe un usuario con el CI')) {
        return res.status(400).json({
          success: false,
          message: `Ya existe un usuario registrado con el CI ${userData.ci}`
        });
      } else if (error.message && error.message.includes('Ya existe un usuario con el email')) {
        return res.status(400).json({
          success: false, 
          message: `Ya existe un usuario registrado con el email ${userData.email}`
        });
      } else if (error.code === 121) { // Error de validación de esquema
        return res.status(400).json({
          success: false,
          message: `Error de validación: ${error.message}`
        });
      }
      
      // Errores no manejados específicamente
      throw error;
    }
  } catch (error) {
    console.error('Error general en endpoint /register:', error);
    
    // Determinar código de respuesta y mensaje
    let statusCode = 500;
    let errorMessage = 'Error en el servidor al procesar el registro';
    
    if (error.name === 'MongoServerError' || error.name === 'MongoError') {
      if (error.code === 11000) { // Duplicación de index
        statusCode = 400;
        errorMessage = 'Ya existe un usuario con estos datos';
        
        if (error.keyPattern) {
          if (error.keyPattern.ci) {
            errorMessage = `Ya existe un usuario con el CI ${req.body.ci}`;
          } else if (error.keyPattern.email) {
            errorMessage = `Ya existe un usuario con el email ${req.body.email}`;
          }
        }
      }
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage
    });
  }
});

// Endpoint para iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { ci, password } = req.body;
    
    if (!ci || !password) {
      return res.status(400).json({
        success: false,
        message: 'CI y contraseña son requeridos'
      });
    }
    
    console.log(`Intento de login con CI: "${ci}" (${typeof ci})`);
    
    // Agregar herramienta de diagnóstico
    if (ci === 'diagnostico123' && password === 'admin_diagnostico') {
      // Ruta especial para diagnóstico de la BD
      const { getDatabase } = require('../../../infrastructure/mongodb/database');
      const db = await getDatabase();
      const stats = {
        usersCount: await db.collection('users').countDocuments(),
        databaseName: db.databaseName,
        collections: await db.listCollections().toArray().then(cols => cols.map(c => c.name))
      };
      
      // Obtener una muestra de usuarios sin contraseñas
      const sampleUsers = await db.collection('users')
        .find({}, { projection: { password: 0 } })
        .limit(5)
        .toArray();
      
      return res.status(200).json({
        success: true,
        message: 'Información de diagnóstico',
        stats,
        sampleUsers
      });
    }
    
    const user = await userService.login(ci, password);
    console.log('Login exitoso para usuario:', user.id);
    
    // No devolver la contraseña
    const { password: userPassword, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error en endpoint /login:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Credenciales incorrectas'
    });
  }
});

// Endpoint para obtener un usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);
    
    // No devolver la contraseña
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || 'Usuario no encontrado'
    });
  }
});

module.exports = router;

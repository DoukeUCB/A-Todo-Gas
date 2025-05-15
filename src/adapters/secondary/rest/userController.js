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
    console.log('Datos recibidos para registro:', userData);
    
    if (!userData.fullName || !userData.ci || !userData.email || !userData.phone || !userData.password || !userData.role) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }
    
    const user = await userService.register(userData);
    console.log('Usuario registrado:', user.id);
    
    // No devolver la contraseña
    const { password, ...userWithoutPassword } = user;
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error en endpoint /register:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al registrar usuario'
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
    
    console.log(`Intento de login con CI: ${ci}`);
    
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

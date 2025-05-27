const express = require('express');
const router = express.Router();
const TicketService = require('../../../application/services/TicketService');
const GasStationService = require('../../../application/services/GasStationService');

const ticketService = new TicketService();
const gasStationService = new GasStationService();

// Inicializar servicios
(async () => {
  try {
    await ticketService.initialize();
    await gasStationService.initialize();
    console.log('Servicios de Tickets y Gasolineras inicializados correctamente');
  } catch (err) {
    console.error('Error al inicializar servicios:', err);
  }
})();

// Endpoint para crear un nuevo ticket
router.post('/', async (req, res) => {
  try {
    const ticketData = req.body;
    console.log('Datos recibidos para crear ticket:', ticketData);
    
    // Verificar que todos los campos requeridos estén presentes
    const requiredFields = ['ci', 'plate', 'stationId', 'stationName'];
    const missingFields = requiredFields.filter(field => !ticketData[field]);
    
    if (missingFields.length > 0) {
      console.log(`Campos faltantes en la solicitud: ${missingFields.join(', ')}`);
      return res.status(400).json({
        success: false,
        message: `Campos requeridos faltantes: ${missingFields.join(', ')}`
      });
    }
    
    // Verificar si la gasolinera existe y está disponible
    const station = await gasStationService.getStationById(ticketData.stationId);
    
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'La gasolinera seleccionada no existe'
      });
    }
    
    if (!station.available) {
      return res.status(400).json({
        success: false,
        message: 'La gasolinera seleccionada no está disponible actualmente'
      });
    }
    
    // Verificar si hay combustible suficiente
    if (ticketData.requestedLiters && station.currentLevel < ticketData.requestedLiters) {
      return res.status(400).json({
        success: false,
        message: `La gasolinera no tiene suficiente combustible. Disponible: ${station.currentLevel} litros`
      });
    }
    
    // Crear el ticket
    const ticket = await ticketService.createTicket(ticketData);
    
    res.status(201).json({
      success: true,
      message: 'Ticket creado correctamente',
      data: ticket
    });
  } catch (error) {
    console.error('Error en endpoint POST /tickets:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear el ticket'
    });
  }
});

// Endpoint para obtener tickets por CI de usuario
router.get('/user/:ci', async (req, res) => {
  try {
    const ci = req.params.ci;
    console.log(`Obteniendo tickets para usuario con CI: ${ci}`);
    
    const tickets = await ticketService.getTicketsByUserCI(ci);
    
    res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error(`Error en endpoint GET /tickets/user/${req.params.ci}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener los tickets'
    });
  }
});

// Endpoint para obtener tickets por ID de gasolinera
router.get('/station/:stationId', async (req, res) => {
  try {
    const stationId = req.params.stationId;
    console.log(`Obteniendo tickets para gasolinera con ID: ${stationId}`);
    
    const tickets = await ticketService.getTicketsByStationId(stationId);
    
    res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error(`Error en endpoint GET /tickets/station/${req.params.stationId}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener los tickets'
    });
  }
});

// Endpoint para obtener un ticket por ID
router.get('/:ticketId', async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    console.log(`Obteniendo ticket con ID: ${ticketId}`);
    
    const ticket = await ticketService.getTicketById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error(`Error en endpoint GET /tickets/${req.params.ticketId}:`, error);
    res.status(404).json({
      success: false,
      message: error.message || 'Ticket no encontrado'
    });
  }
});

module.exports = router;

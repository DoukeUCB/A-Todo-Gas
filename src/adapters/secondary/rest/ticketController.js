const express = require('express');
const router = express.Router();
const TicketService = require('../../../application/services/TicketService');

// Creamos el servicio
const ticketService = new TicketService();

// Inicializamos el servicio
ticketService.initialize()
  .then(() => console.log('TicketService inicializado correctamente'))
  .catch(err => console.error('Error al inicializar TicketService:', err));

// Endpoint para crear un nuevo ticket
router.post('/', async (req, res) => {
  try {
    const ticketData = req.body;
    console.log('Datos recibidos para crear ticket:', ticketData);
    
    const ticket = await ticketService.createTicket(ticketData);
    console.log('Ticket creado:', ticket.id);
    
    res.status(201).json({
      success: true,
      message: 'Ticket creado correctamente',
      data: ticket
    });
  } catch (error) {
    console.error('Error en endpoint POST /tickets:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al crear el ticket'
    });
  }
});

// Endpoint para obtener tickets por CI de usuario
router.get('/user/:ci', async (req, res) => {
  try {
    const ci = req.params.ci;
    console.log(`Buscando tickets para usuario con CI: ${ci}`);
    
    const tickets = await ticketService.getTicketsByUserCI(ci);
    
    res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error(`Error en endpoint GET /tickets/user/:ci (${req.params.ci}):`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener los tickets'
    });
  }
});

// Endpoint para obtener tickets por ID de estación
router.get('/station/:stationId', async (req, res) => {
  try {
    const stationId = req.params.stationId;
    console.log(`Buscando tickets para estación con ID: ${stationId}`);
    
    const tickets = await ticketService.getTicketsByStationId(stationId);
    
    res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error(`Error en endpoint GET /tickets/station/:stationId (${req.params.stationId}):`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener los tickets'
    });
  }
});

module.exports = router;

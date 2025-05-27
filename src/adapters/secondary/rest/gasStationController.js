const express = require('express');
const router = express.Router();
const GasStationService = require('../../../application/services/GasStationService');

// Creamos el servicio
const gasStationService = new GasStationService();

// Inicializamos el servicio
gasStationService.initialize()
  .then(() => console.log('GasStationService inicializado correctamente'))
  .catch(err => console.error('Error al inicializar GasStationService:', err));

// Endpoint para crear una nueva gasolinera
router.post('/', async (req, res) => {
  try {
    const stationData = req.body;
    console.log('Datos recibidos para crear gasolinera:', stationData);
    
    const station = await gasStationService.createStation(stationData);
    console.log('Gasolinera creada:', station.id);
    
    res.status(201).json({
      success: true,
      message: 'Gasolinera creada correctamente',
      data: station
    });
  } catch (error) {
    console.error('Error en endpoint POST /', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al crear la gasolinera'
    });
  }
});

// Endpoint para obtener todas las gasolineras
router.get('/', async (req, res) => {
  try {
    console.log('Obteniendo todas las gasolineras');
    
    const stations = await gasStationService.getAllStations();
    
    res.status(200).json({
      success: true,
      data: stations
    });
  } catch (error) {
    console.error('Error en endpoint GET /', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener las gasolineras'
    });
  }
});

// Endpoint para obtener gasolineras disponibles con combustible
// IMPORTANTE: Esta ruta debe estar ANTES de la ruta por ID
router.get('/available', async (req, res) => {
  try {
    console.log('Obteniendo gasolineras disponibles con combustible');
    
    const availableStations = await gasStationService.getAvailableStations();
    console.log(`Se encontraron ${availableStations.length} gasolineras disponibles`);
    
    res.status(200).json({
      success: true,
      data: availableStations
    });
  } catch (error) {
    console.error('Error en endpoint GET /available:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener las gasolineras disponibles'
    });
  }
});

// Endpoint para obtener una gasolinera por CI del administrador
// IMPORTANTE: Esta ruta debe estar antes de la ruta por ID
router.get('/manager/:managerCi', async (req, res) => {
  try {
    const managerCi = req.params.managerCi;
    console.log('Buscando gasolinera para administrador con CI:', managerCi);
    
    const station = await gasStationService.getStationByManagerCI(managerCi);
    
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró gasolinera para este administrador'
      });
    }
    
    res.status(200).json({
      success: true,
      data: station
    });
  } catch (error) {
    console.error(`Error en endpoint GET /manager/:managerCi (${req.params.managerCi}):`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al buscar la gasolinera'
    });
  }
});

// Endpoint para obtener una gasolinera por ID
router.get('/:stationId', async (req, res) => {
  try {
    const stationId = req.params.stationId;
    console.log('Buscando gasolinera con ID:', stationId);
    
    const station = await gasStationService.getStationById(stationId);
    
    res.status(200).json({
      success: true,
      data: station
    });
  } catch (error) {
    console.error(`Error en endpoint GET /:stationId (${req.params.stationId}):`, error);
    res.status(404).json({
      success: false,
      message: error.message || 'Gasolinera no encontrada'
    });
  }
});

// Endpoint para actualizar una gasolinera
router.put('/:stationId', async (req, res) => {
  try {
    const stationId = req.params.stationId;
    const updatedData = req.body;
    console.log(`Actualizando gasolinera ${stationId}:`, updatedData);
    
    const station = await gasStationService.updateStation(stationId, updatedData);
    
    res.status(200).json({
      success: true,
      message: 'Gasolinera actualizada correctamente',
      data: station
    });
  } catch (error) {
    console.error(`Error en endpoint PUT /:stationId (${req.params.stationId}):`, error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al actualizar la gasolinera'
    });
  }
});

module.exports = router;

const { v4: uuidv4 } = require('uuid');
const TicketRepository = require('../../domain/repositories/TicketRepository');
const GasStationRepository = require('../../domain/repositories/GasStationRepository');

class TicketService {
  constructor() {
    this.ticketRepository = new TicketRepository();
    this.gasStationRepository = new GasStationRepository();
  }

  async initialize() {
    try {
      // Asegurarnos de que las inicializaciones se ejecuten correctamente
      await this.ticketRepository.initialize();
      await this.gasStationRepository.initialize();
      console.log('Servicio de tickets inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar el servicio de tickets:', error);
      throw error;
    }
  }

  async createTicket(ticketData) {
    try {
      // Generar un UUID único para el ticket
      const ticketId = uuidv4();
      
      // Obtener la gasolinera y su contador de tickets
      const gasStation = await this.gasStationRepository.findById(ticketData.stationId);
      if (!gasStation) {
        throw new Error('La gasolinera no existe');
      }
      
      // Incrementar el contador de tickets para esta gasolinera
      const ticketNumber = gasStation.ticketCount + 1;
      
      // Actualizar el contador en la gasolinera
      await this.gasStationRepository.update(
        ticketData.stationId, 
        { ticketCount: ticketNumber }
      );
      
      // Crear el objeto ticket con todos los campos requeridos por el esquema
      const ticket = {
        _id: ticketId,
        ci: ticketData.ci,
        plate: ticketData.plate.toUpperCase(),
        ticketNumber: ticketNumber,
        stationId: ticketData.stationId,
        stationName: ticketData.stationName,
        requestedLiters: parseFloat(ticketData.requestedLiters) || 0,
        createdAt: new Date()
      };
      
      console.log('Creando ticket con datos:', ticket);
      
      // Guardar el ticket en la base de datos
      const createdTicket = await this.ticketRepository.create(ticket);
      return createdTicket;
    } catch (error) {
      console.error('Error al crear ticket:', error);
      throw error;
    }
  }

  async getTicketsByUserCI(ci) {
    return this.ticketRepository.findByUserCI(ci);
  }

  async getTicketsByStationId(stationId) {
    return this.ticketRepository.findByStationId(stationId);
  }

  async getTicketById(ticketId) {
    return this.ticketRepository.findById(ticketId);
  }
}

module.exports = TicketService;

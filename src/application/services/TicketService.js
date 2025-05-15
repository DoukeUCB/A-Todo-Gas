const { v4: uuidv4 } = require('uuid');
const Ticket = require('../../domain/entities/Ticket');
const { getDatabase } = require('../../infrastructure/mongodb/database');

class TicketService {
  constructor() {
    this.collection = null;
    this._initPromise = null;
  }
  
  /**
   * Inicializa el servicio asegurándose de que la base de datos esté disponible
   * @returns {Promise<void>}
   */
  async initialize() {
    if (!this._initPromise) {
      this._initPromise = this._init();
    }
    return this._initPromise;
  }
  
  /**
   * Inicializa internamente la colección
   * @private
   */
  async _init() {
    try {
      const db = await getDatabase();
      this.collection = db.collection('tickets');
    } catch (error) {
      console.error('Error al inicializar TicketService:', error);
      throw error;
    }
  }
  
  async createTicket(ticketData) {
    await this.initialize();
    try {
      // Obtener el siguiente número de ticket para esta estación
      const lastTicket = await this.collection.findOne(
        { stationId: ticketData.stationId },
        { sort: { ticketNumber: -1 } }
      );
      
      const nextTicketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 1;
      
      const ticketToCreate = {
        id: uuidv4(),
        ci: ticketData.ci,
        plate: ticketData.plate.toUpperCase(),
        ticketNumber: nextTicketNumber,
        stationId: ticketData.stationId,
        stationName: ticketData.stationName,
        createdAt: new Date()
      };
      
      const ticket = new Ticket(ticketToCreate);
      
      // Convertir a documento MongoDB
      const ticketDoc = {
        _id: ticket.id,
        ci: ticket.ci,
        plate: ticket.plate,
        ticketNumber: ticket.ticketNumber,
        stationId: ticket.stationId,
        stationName: ticket.stationName,
        createdAt: ticket.createdAt
      };
      
      await this.collection.insertOne(ticketDoc);
      
      return ticket;
    } catch (error) {
      throw error;
    }
  }
  
  async getTicketsByUserCI(ci) {
    await this.initialize();
    try {
      const ticketDocs = await this.collection.find({ ci }).sort({ createdAt: -1 }).toArray();
      
      return ticketDocs.map(doc => new Ticket({
        id: doc._id,
        ci: doc.ci,
        plate: doc.plate,
        ticketNumber: doc.ticketNumber,
        stationId: doc.stationId,
        stationName: doc.stationName,
        createdAt: doc.createdAt
      }));
    } catch (error) {
      throw error;
    }
  }
  
  async getTicketsByStationId(stationId) {
    await this.initialize();
    try {
      const ticketDocs = await this.collection.find({ stationId }).sort({ ticketNumber: 1 }).toArray();
      
      return ticketDocs.map(doc => new Ticket({
        id: doc._id,
        ci: doc.ci,
        plate: doc.plate,
        ticketNumber: doc.ticketNumber,
        stationId: doc.stationId,
        stationName: doc.stationName,
        createdAt: doc.createdAt
      }));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TicketService;

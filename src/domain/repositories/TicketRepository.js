const { getDatabase } = require('../../infrastructure/mongodb/database');

class TicketRepository {
  constructor() {
    this.collection = null;
  }

  async initialize() {
    try {
      const db = getDatabase();
      // Asegurarnos de que db es un objeto válido
      if (!db || typeof db.collection !== 'function') {
        throw new Error('Objeto de base de datos inválido o no inicializado correctamente');
      }
      
      this.collection = db.collection('tickets');
      console.log('Repositorio de tickets inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar repositorio de tickets:', error);
      throw error;
    }
  }

  async create(ticket) {
    try {
      if (!this.collection) {
        throw new Error('Repositorio no inicializado');
      }
      
      const result = await this.collection.insertOne(ticket);
      if (!result.acknowledged) {
        throw new Error('Error al insertar el ticket en la base de datos');
      }
      return ticket;
    } catch (error) {
      console.error('Error al crear ticket en repositorio:', error);
      throw error;
    }
  }

  async findByUserCI(ci) {
    try {
      if (!this.collection) {
        throw new Error('Repositorio no inicializado');
      }
      
      return await this.collection.find({ ci }).toArray();
    } catch (error) {
      console.error(`Error al buscar tickets por CI ${ci}:`, error);
      throw error;
    }
  }

  async findByStationId(stationId) {
    try {
      if (!this.collection) {
        throw new Error('Repositorio no inicializado');
      }
      
      return await this.collection.find({ stationId }).toArray();
    } catch (error) {
      console.error(`Error al buscar tickets por estación ${stationId}:`, error);
      throw error;
    }
  }

  async findById(ticketId) {
    try {
      if (!this.collection) {
        throw new Error('Repositorio no inicializado');
      }
      
      return await this.collection.findOne({ _id: ticketId });
    } catch (error) {
      console.error(`Error al buscar ticket ${ticketId}:`, error);
      throw error;
    }
  }
}

module.exports = TicketRepository;

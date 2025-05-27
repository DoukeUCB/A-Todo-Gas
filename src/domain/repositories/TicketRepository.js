const { getDatabase } = require('../../infrastructure/mongodb/database');

class TicketRepository {
  constructor() {
    this.collection = null;
  }

  async initialize() {
    try {
      const db = getDatabase();
      if (!db) {
        throw new Error('La base de datos no está disponible');
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
      
      // Validar que el ticket tenga todos los campos requeridos
      const requiredFields = ['_id', 'ci', 'plate', 'ticketNumber', 'stationId', 'stationName', 'requestedLiters', 'createdAt'];
      for (const field of requiredFields) {
        if (ticket[field] === undefined) {
          throw new Error(`Campo requerido faltante: ${field}`);
        }
      }
      
      // Validar tipos de datos
      if (typeof ticket.ticketNumber !== 'number' || !Number.isInteger(ticket.ticketNumber)) {
        console.error('ticketNumber no es un entero:', ticket.ticketNumber);
        ticket.ticketNumber = Math.floor(Number(ticket.ticketNumber));
      }
      
      if (typeof ticket.requestedLiters !== 'number') {
        console.error('requestedLiters no es un número:', ticket.requestedLiters);
        ticket.requestedLiters = parseFloat(ticket.requestedLiters);
      }
      
      if (!(ticket.createdAt instanceof Date)) {
        console.error('createdAt no es un objeto Date:', ticket.createdAt);
        ticket.createdAt = new Date(ticket.createdAt);
      }
      
      console.log('Insertando ticket en MongoDB:', JSON.stringify(ticket, null, 2));
      
      const result = await this.collection.insertOne(ticket);
      if (!result.acknowledged) {
        throw new Error('Error al insertar el ticket en la base de datos');
      }
      
      console.log('Ticket insertado correctamente con ID:', ticket._id);
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

const { v4: uuidv4 } = require('uuid');
const database = require('../db/connection');

class Ticket {
  static async getCollection() {
    const db = await database.connect();
    return db.collection('tickets');
  }

  static async findById(id) {
    const collection = await this.getCollection();
    return collection.findOne({ _id: id });
  }

  static async findByUserCI(ci) {
    const collection = await this.getCollection();
    return collection.find({ ci }).toArray();
  }

  static async findByStationId(stationId) {
    const collection = await this.getCollection();
    return collection.find({ stationId }).toArray();
  }

  static async getNextTicketNumber(stationId) {
    const collection = await this.getCollection();
    const lastTicket = await collection.find({ stationId })
      .sort({ ticketNumber: -1 })
      .limit(1)
      .toArray();
    
    return lastTicket.length > 0 ? lastTicket[0].ticketNumber + 1 : 1;
  }

  static async create(ticketData) {
    const collection = await this.getCollection();
    
    // Obtener el siguiente número de ticket para la estación
    const ticketNumber = await this.getNextTicketNumber(ticketData.stationId);
    
    const ticket = {
      _id: uuidv4(),
      ...ticketData,
      ticketNumber,
      createdAt: new Date()
    };
    
    await collection.insertOne(ticket);
    return ticket;
  }

  static async update(id, ticketData) {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { _id: id },
      { $set: ticketData }
    );
    return result.modifiedCount > 0;
  }

  static async delete(id) {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}

module.exports = Ticket;

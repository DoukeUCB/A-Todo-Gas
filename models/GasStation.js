const { v4: uuidv4 } = require('uuid');
const database = require('../db/connection');

class GasStation {
  static async getCollection() {
    const db = await database.connect();
    return db.collection('gasStations');
  }

  static async findById(id) {
    const collection = await this.getCollection();
    return collection.findOne({ _id: id });
  }

  static async findByStationNumber(stationNumber) {
    const collection = await this.getCollection();
    return collection.findOne({ stationNumber: parseInt(stationNumber) });
  }

  static async findByManagerCi(managerCi) {
    const collection = await this.getCollection();
    return collection.findOne({ managerCi });
  }

  static async getAll() {
    const collection = await this.getCollection();
    return collection.find({}).toArray();
  }

  static async create(stationData) {
    const collection = await this.getCollection();
    const gasStation = {
      _id: uuidv4(),
      ...stationData,
      stationNumber: parseInt(stationData.stationNumber),
      openTime: new Date(stationData.openTime),
      closeTime: new Date(stationData.closeTime)
    };
    await collection.insertOne(gasStation);
    return gasStation;
  }

  static async update(id, stationData) {
    const collection = await this.getCollection();
    
    // Convertir campos numéricos y fechas si existen
    if (stationData.stationNumber) stationData.stationNumber = parseInt(stationData.stationNumber);
    if (stationData.openTime) stationData.openTime = new Date(stationData.openTime);
    if (stationData.closeTime) stationData.closeTime = new Date(stationData.closeTime);
    
    const result = await collection.updateOne(
      { _id: id },
      { $set: stationData }
    );
    return result.modifiedCount > 0;
  }

  static async delete(id) {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}

module.exports = GasStation;

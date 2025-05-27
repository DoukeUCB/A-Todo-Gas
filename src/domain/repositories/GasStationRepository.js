const { getDatabase } = require('../../infrastructure/mongodb/database');

class GasStationRepository {
  constructor() {
    this.collection = null;
  }

  async initialize() {
    try {
      const db = getDatabase();
      this.collection = db.collection('gasStations');
      console.log('Repositorio de gasolineras inicializado');
    } catch (error) {
      console.error('Error al inicializar repositorio de gasolineras:', error);
      throw error;
    }
  }

  async findById(stationId) {
    try {
      return await this.collection.findOne({ _id: stationId });
    } catch (error) {
      console.error(`Error al buscar gasolinera ${stationId}:`, error);
      throw error;
    }
  }

  async update(stationId, updateData) {
    try {
      const result = await this.collection.updateOne(
        { _id: stationId },
        { $set: updateData }
      );
      
      if (!result.acknowledged) {
        throw new Error(`Error al actualizar gasolinera ${stationId}`);
      }
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error(`Error al actualizar gasolinera ${stationId}:`, error);
      throw error;
    }
  }

  async findAvailable() {
    try {
      return await this.collection.find({ available: true }).toArray();
    } catch (error) {
      console.error('Error al buscar gasolineras disponibles:', error);
      throw error;
    }
  }
}

module.exports = GasStationRepository;

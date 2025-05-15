const GasStation = require('../../domain/entities/GasStation');
const { v4: uuidv4 } = require('uuid');

class MongoGasStationRepository {
  constructor(db) {
    this.collection = db.collection('gasStations');
  }

  async create(gasStation) {
    // Si no tiene ID, generamos uno
    if (!gasStation.id) {
      gasStation.id = uuidv4();
    }

    // Verificar si ya existe una gasolinera con el mismo número
    const existingStation = await this.findByStationNumber(gasStation.stationNumber);
    if (existingStation) {
      throw new Error(`Ya existe una gasolinera con el número: ${gasStation.stationNumber}`);
    }

    // Convertir la entidad a documento MongoDB
    const gasStationDoc = this._toMongoDocument(gasStation);

    try {
      await this.collection.insertOne(gasStationDoc);
      return gasStation;
    } catch (error) {
      if (error.code === 11000) { // Error de clave duplicada
        throw new Error(`Ya existe una gasolinera con el número: ${gasStation.stationNumber}`);
      }
      throw error;
    }
  }

  async findById(id) {
    const gasStationDoc = await this.collection.findOne({ _id: id });
    return gasStationDoc ? this._toEntity(gasStationDoc) : null;
  }

  async findByStationNumber(stationNumber) {
    const gasStationDoc = await this.collection.findOne({ stationNumber: parseInt(stationNumber) });
    return gasStationDoc ? this._toEntity(gasStationDoc) : null;
  }

  async findByManagerCI(managerCi) {
    const gasStationDoc = await this.collection.findOne({ managerCi });
    return gasStationDoc ? this._toEntity(gasStationDoc) : null;
  }

  async findAll() {
    const gasStationDocs = await this.collection.find({}).toArray();
    return gasStationDocs.map(doc => this._toEntity(doc));
  }

  async update(id, updateData) {
    const updateDoc = {};
    
    // Solo permitir actualizar ciertos campos
    if (updateData.name !== undefined) updateDoc.name = updateData.name;
    if (updateData.address !== undefined) updateDoc.address = updateData.address;
    if (updateData.openTime !== undefined) updateDoc.openTime = updateData.openTime;
    if (updateData.closeTime !== undefined) updateDoc.closeTime = updateData.closeTime;
    
    // No permitir actualizar stationNumber o managerCi

    const result = await this.collection.updateOne(
      { _id: id },
      { $set: updateDoc }
    );

    return result.modifiedCount > 0;
  }

  async delete(id) {
    const result = await this.collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  // Convierte un documento MongoDB a entidad de dominio
  _toEntity(doc) {
    return new GasStation({
      id: doc._id,
      stationNumber: doc.stationNumber,
      name: doc.name,
      address: doc.address,
      openTime: doc.openTime,
      closeTime: doc.closeTime,
      managerCi: doc.managerCi
    });
  }

  // Convierte una entidad de dominio a documento MongoDB
  _toMongoDocument(gasStation) {
    return {
      _id: gasStation.id,
      stationNumber: gasStation.stationNumber,
      name: gasStation.name,
      address: gasStation.address,
      openTime: gasStation.openTime,
      closeTime: gasStation.closeTime,
      managerCi: gasStation.managerCi
    };
  }
}

module.exports = MongoGasStationRepository;

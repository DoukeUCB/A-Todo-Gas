const { v4: uuidv4 } = require('uuid');
const GasStation = require('../../domain/entities/GasStation');

/**
 * Repositorio para la persistencia de GasStations en MongoDB
 */
class MongoGasStationRepository {
  /**
   * Constructor del repositorio
   * @param {Object} database - Instancia de la base de datos MongoDB
   */
  constructor(database) {
    this.collection = database.collection('gasStations');
  }

  /**
   * Convierte una entidad GasStation a documento MongoDB
   * @param {GasStation} gasStation - Entidad de gasolinera del dominio
   * @returns {Object} Documento para MongoDB
   * @private
   */
  _toDocument(gasStation) {
    return {
      _id: gasStation.id,
      stationNumber: Number.parseInt(gasStation.stationNumber), // Convertir explícitamente a int para MongoDB
      name: gasStation.name,
      address: gasStation.address,
      openTime: new Date(gasStation.openTime), // Asegurar que sea objeto Date
      closeTime: new Date(gasStation.closeTime), // Asegurar que sea objeto Date
      managerCi: gasStation.managerCi
    };
  }

  /**
   * Convierte un documento MongoDB a entidad GasStation
   * @param {Object} doc - Documento de MongoDB
   * @returns {GasStation} Entidad de gasolinera del dominio
   * @private
   */
  _toEntity(doc) {
    if (!doc) return null;

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

  /**
   * Crea una nueva gasolinera en la base de datos
   * @param {GasStation} gasStation - Entidad de gasolinera del dominio
   * @returns {Promise<GasStation>} Gasolinera creada con ID generado
   */
  async create(gasStation) {
    // Generar ID si no existe
    const stationToSave = { ...gasStation };
    if (!stationToSave.id) {
      stationToSave.id = uuidv4();
    }

    // Convertir a documento MongoDB y guardar
    const doc = this._toDocument(stationToSave);
    
    try {
      await this.collection.insertOne(doc);
      return this._toEntity(doc);
    } catch (error) {
      console.error('Error al guardar la gasolinera en MongoDB:', error);
      throw new Error(
        error.code === 11000 
          ? 'Ya existe una gasolinera con este número o administrador' 
          : 'Error al guardar la gasolinera'
      );
    }
  }

  /**
   * Busca una gasolinera por su ID
   * @param {string} id - ID de la gasolinera
   * @returns {Promise<GasStation|null>} Gasolinera encontrada o null
   */
  async findById(id) {
    const doc = await this.collection.findOne({ _id: id });
    return this._toEntity(doc);
  }

  /**
   * Busca una gasolinera por su número
   * @param {number} stationNumber - Número de la gasolinera
   * @returns {Promise<GasStation|null>} Gasolinera encontrada o null
   */
  async findByStationNumber(stationNumber) {
    // Convertir a entero para asegurar consistencia en la búsqueda
    const numericStationNumber = Number.parseInt(stationNumber);
    const doc = await this.collection.findOne({ stationNumber: numericStationNumber });
    return this._toEntity(doc);
  }

  /**
   * Busca una gasolinera por el CI del administrador
   * @param {string} managerCi - CI del administrador
   * @returns {Promise<GasStation|null>} Gasolinera encontrada o null
   */
  async findByManagerCI(managerCi) {
    const doc = await this.collection.findOne({ managerCi });
    return this._toEntity(doc);
  }

  /**
   * Obtiene todas las gasolineras
   * @returns {Promise<Array<GasStation>>} Lista de gasolineras
   */
  async findAll() {
    const docs = await this.collection.find({}).toArray();
    return docs.map(doc => this._toEntity(doc));
  }

  /**
   * Actualiza una gasolinera
   * @param {string} id - ID de la gasolinera
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<boolean>} True si se actualizó correctamente
   */
  async update(id, updateData) {
    const updateDoc = {};

    // Procesar solo los campos permitidos
    if (updateData.name !== undefined) updateDoc.name = updateData.name;
    if (updateData.address !== undefined) updateDoc.address = updateData.address;
    
    // Convertir fechas si están presentes
    if (updateData.openTime !== undefined) {
      updateDoc.openTime = new Date(updateData.openTime);
    }
    
    if (updateData.closeTime !== undefined) {
      updateDoc.closeTime = new Date(updateData.closeTime);
    }

    // Si se incluye stationNumber, asegurar que sea entero
    if (updateData.stationNumber !== undefined) {
      updateDoc.stationNumber = Number.parseInt(updateData.stationNumber);
    }

    try {
      const result = await this.collection.updateOne(
        { _id: id },
        { $set: updateDoc }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error al actualizar la gasolinera:', error);
      throw new Error('Error al actualizar la gasolinera');
    }
  }

  /**
   * Elimina una gasolinera
   * @param {string} id - ID de la gasolinera
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  async delete(id) {
    const result = await this.collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}

module.exports = MongoGasStationRepository;

const CreateGasStationUseCase = require('../use_cases/CreateGasStationUseCase');
const GetAvailableGasStationsUseCase = require('../use_cases/GetAvailableGasStationsUseCase');
const MongoGasStationRepository = require('../../infrastructure/mongodb/MongoGasStationRepository');
const { getDatabase } = require('../../infrastructure/mongodb/database');

class GasStationService {
  constructor() {
    this.gasStationRepository = null;
    this.createGasStationUseCase = null;
    this.getAvailableGasStationsUseCase = null;
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
   * Inicializa internamente el repositorio y los casos de uso
   * @private
   */
  async _init() {
    try {
      const db = await getDatabase();
      this.gasStationRepository = new MongoGasStationRepository(db);
      this.createGasStationUseCase = new CreateGasStationUseCase(this.gasStationRepository);
      this.getAvailableGasStationsUseCase = new GetAvailableGasStationsUseCase(this.gasStationRepository);
    } catch (error) {
      console.error('Error al inicializar GasStationService:', error);
      throw error;
    }
  }
  
  async createStation(stationData) {
    await this.initialize();
    try {
      return await this.createGasStationUseCase.execute(stationData);
    } catch (error) {
      throw error;
    }
  }
  
  async getStationById(id) {
    await this.initialize();
    try {
      const station = await this.gasStationRepository.findById(id);
      if (!station) {
        throw new Error('Gasolinera no encontrada');
      }
      return station;
    } catch (error) {
      throw error;
    }
  }
  
  async getStationByManagerCI(managerCi) {
    await this.initialize();
    try {
      return await this.gasStationRepository.findByManagerCI(managerCi);
    } catch (error) {
      throw error;
    }
  }
  
  async getAllStations() {
    await this.initialize();
    try {
      return await this.gasStationRepository.findAll();
    } catch (error) {
      throw error;
    }
  }
  
  async getAvailableStations() {
    await this.initialize();
    try {
      return await this.getAvailableGasStationsUseCase.execute();
    } catch (error) {
      console.error('Error al obtener gasolineras disponibles:', error);
      throw error;
    }
  }
  
  async updateStation(id, updateData) {
    await this.initialize();
    try {
      const station = await this.gasStationRepository.findById(id);
      if (!station) {
        throw new Error('Gasolinera no encontrada');
      }
      
      // Validar horarios si se están actualizando
      if (updateData.openTime && updateData.closeTime) {
        const openTime = new Date(updateData.openTime);
        const closeTime = new Date(updateData.closeTime);
        
        if (closeTime <= openTime) {
          throw new Error('La hora de cierre debe ser posterior a la hora de apertura');
        }
      }
      
      const success = await this.gasStationRepository.update(id, updateData);
      if (!success) {
        throw new Error('No se pudo actualizar la gasolinera');
      }
      
      return await this.gasStationRepository.findById(id);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = GasStationService;

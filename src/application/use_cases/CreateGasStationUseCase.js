const GasStation = require('../../domain/entities/GasStation');

class CreateGasStationUseCase {
  constructor(gasStationRepository) {
    this.gasStationRepository = gasStationRepository;
  }
  
  async execute(gasStationData) {
    // Verificar si ya existe una gasolinera con el mismo número
    const existingStationByNumber = await this.gasStationRepository.findByStationNumber(gasStationData.stationNumber);
    if (existingStationByNumber) {
      throw new Error(`Ya existe una gasolinera con el número: ${gasStationData.stationNumber}`);
    }
    
    // Verificar si el administrador ya tiene una gasolinera asignada
    const existingStationByManager = await this.gasStationRepository.findByManagerCI(gasStationData.managerCi);
    if (existingStationByManager) {
      throw new Error(`El administrador con CI: ${gasStationData.managerCi} ya tiene una gasolinera asignada`);
    }
    
    // Crear entidad de dominio
    const gasStation = new GasStation(gasStationData);
    
    // Persistir la gasolinera
    return this.gasStationRepository.create(gasStation);
  }
}

module.exports = CreateGasStationUseCase;

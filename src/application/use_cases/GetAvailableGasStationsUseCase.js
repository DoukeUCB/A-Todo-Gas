/**
 * Caso de uso para obtener gasolineras disponibles con combustible
 */
class GetAvailableGasStationsUseCase {
  /**
   * Constructor
   * @param {Object} gasStationRepository - Repositorio para acceder a las gasolineras
   */
  constructor(gasStationRepository) {
    this.gasStationRepository = gasStationRepository;
  }

  /**
   * Ejecuta el caso de uso
   * @returns {Promise<Array>} Lista de gasolineras disponibles con combustible
   */
  async execute() {
    // Obtener todas las gasolineras
    const allStations = await this.gasStationRepository.findAll();
    
    // Filtrar solo las que tienen combustible y están disponibles
    return allStations.filter(station => 
      station.available === true && station.currentLevel > 0
    );
  }
}

module.exports = GetAvailableGasStationsUseCase;

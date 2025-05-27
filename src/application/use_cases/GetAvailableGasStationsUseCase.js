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
    console.log('Ejecutando GetAvailableGasStationsUseCase');
    
    try {
      // Obtener todas las gasolineras
      const allStations = await this.gasStationRepository.findAll();
      console.log(`Obtenidas ${allStations.length} gasolineras en total`);
      
      // Filtrar solo las que tienen combustible y están disponibles
      const availableStations = allStations.filter(station => 
        station.available === true && station.currentLevel > 0
      );
      
      console.log(`Filtradas ${availableStations.length} gasolineras disponibles con combustible`);
      
      return availableStations;
    } catch (error) {
      console.error('Error en GetAvailableGasStationsUseCase:', error);
      throw error;
    }
  }
}

module.exports = GetAvailableGasStationsUseCase;

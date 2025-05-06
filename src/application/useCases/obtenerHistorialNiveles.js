export class ObtenerHistorialNivelesUseCase {
  constructor(nivelCombustibleRepository) {
    this.nivelCombustibleRepository = nivelCombustibleRepository;
  }

  async execute(dispenserId) {
    if (!dispenserId) {
      throw new Error("Se debe proporcionar un ID de surtidor");
    }
    
    return await this.nivelCombustibleRepository.findByDispenserId(dispenserId);
  }
}

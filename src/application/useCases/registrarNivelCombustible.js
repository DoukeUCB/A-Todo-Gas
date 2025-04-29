import { NivelCombustible } from "../../domain/entities/NivelCombustible.js";

export class RegistrarNivelCombustibleUseCase {
  constructor(nivelCombustibleRepository) {
    this.nivelCombustibleRepository = nivelCombustibleRepository;
  }

  async execute(dispenserId, percentage) {
    // Validaciones
    if (!dispenserId) {
      throw new Error("Se debe seleccionar un surtidor");
    }
    
    if (percentage < 0 || percentage > 100) {
      throw new Error("El porcentaje debe estar entre 0 y 100");
    }

    // Registrar el nivel de combustible
    return await this.nivelCombustibleRepository.save({
      dispenserId,
      percentage,
      recordedAt: new Date()
    });
  }
}

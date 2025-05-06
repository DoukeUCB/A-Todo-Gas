import { NivelCombustible } from "../../domain/entities/NivelCombustible.js";

export class RegistrarNivelCombustibleUseCase {
  constructor(nivelCombustibleRepository, surtidorRepository) {
    this.nivelCombustibleRepository = nivelCombustibleRepository;
    this.surtidorRepository = surtidorRepository;
  }

  async execute(nivelData) {
    const dispenserId = nivelData.dispenserId;
    const percentage = nivelData.percentage;
    
    // Validaciones
    if (percentage < 0 || percentage > 100) {
      throw new Error("El porcentaje debe estar entre 0 y 100");
    }
    
    // Verificar que el surtidor existe
    const surtidor = await this.surtidorRepository.findById(dispenserId);
    if (!surtidor) {
      throw new Error("El surtidor no existe");
    }

    // Registrar el nivel de combustible (corregido para pasar los parámetros correctamente)
    return await this.nivelCombustibleRepository.save({
      dispenserId: dispenserId,
      percentage: percentage,
      recordedAt: new Date()
    });
  }
  
  // Implementar método para obtener historial
  async obtenerHistorial(dispenserId) {
    return await this.nivelCombustibleRepository.findByDispenserId(dispenserId);
  }
  
  // Implementar método para obtener el último nivel
  async obtenerUltimoNivel(dispenserId) {
    const historial = await this.nivelCombustibleRepository.findByDispenserId(dispenserId);
    
    if (historial && historial.length > 0) {
      // Ordenar por fecha más reciente
      return historial.sort((a, b) => 
        new Date(b.recordedAt) - new Date(a.recordedAt)
      )[0];
    }
    
    return null;
  }
}

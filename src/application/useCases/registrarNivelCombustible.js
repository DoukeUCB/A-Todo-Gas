import { NivelCombustible } from "../../domain/entities/NivelCombustible.js";

export class RegistrarNivelCombustibleUseCase {
  constructor(nivelCombustibleRepository, surtidorRepository) {
    this.nivelCombustibleRepository = nivelCombustibleRepository;
    this.surtidorRepository = surtidorRepository;
  }

  async execute(nivelCombustibleData) {
    // Verificar si el surtidor existe
    const surtidor = await this.surtidorRepository.findById(nivelCombustibleData.dispenserId);
    if (!surtidor) {
      throw new Error("El surtidor no existe");
    }

    // Crear y validar la entidad NivelCombustible
    const nivelCombustible = new NivelCombustible(
      nivelCombustibleData.dispenserId,
      nivelCombustibleData.percentage
    );
    
    nivelCombustible.validate();
    
    // Guardar el nivel de combustible en el repositorio
    return await this.nivelCombustibleRepository.save(nivelCombustible);
  }

  async obtenerHistorial(dispenserId) {
    return await this.nivelCombustibleRepository.findByDispenserId(dispenserId);
  }

  async obtenerUltimoNivel(dispenserId) {
    const historial = await this.nivelCombustibleRepository.findByDispenserId(dispenserId);
    
    if (!historial || historial.length === 0) {
      return null;
    }
    
    // Ordenar por fecha de registro y obtener el más reciente
    return historial.sort((a, b) => 
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    )[0];
  }
}

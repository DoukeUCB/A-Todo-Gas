import { Gasolinera } from "../../domain/entities/Gasolinera.js";

export class RegistrarGasolineraUseCase {
  constructor(gasolineraRepository) {
    this.gasolineraRepository = gasolineraRepository;
  }

  async execute(gasolineraData) {
    // Verificar si el usuario ya tiene una gasolinera registrada
    const existente = await this.gasolineraRepository.findByUserId(gasolineraData.userId);
    if (existente) {
      throw new Error("El usuario ya tiene una gasolinera registrada");
    }

    // Crear y validar la entidad Gasolinera
    const gasolinera = new Gasolinera(
      gasolineraData.userId,
      gasolineraData.name,
      gasolineraData.address,
      gasolineraData.openTime,
      gasolineraData.closeTime
    );
    
    gasolinera.validate();
    
    // Guardar la gasolinera en el repositorio
    return await this.gasolineraRepository.save(gasolinera);
  }
}

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
    
    // Verificar si ya existe una gasolinera con la misma dirección
    const duplicada = await this.gasolineraRepository.findByAddress(gasolineraData.address);
    if (duplicada) {
      throw new Error("Ya existe una gasolinera registrada con esta dirección");
    }
    
    // Validar horarios
    if (gasolineraData.openTime >= gasolineraData.closeTime) {
      throw new Error("El horario de apertura debe ser menor al horario de cierre");
    }

    // Crear y validar la entidad Gasolinera
    const gasolinera = new Gasolinera(
      gasolineraData.userId,
      gasolineraData.name,
      gasolineraData.address,
      gasolineraData.openTime,
      gasolineraData.closeTime
    );
    console.log("Gasolinera creada:", gasolinera);
    try {
      gasolinera.validate();
    } catch (error) {
      throw new Error("La validación de la gasolinera falló: " + error.message);
    }
    
    // Guardar la gasolinera en el repositorio
    return await this.gasolineraRepository.save(gasolinera);
  }
}

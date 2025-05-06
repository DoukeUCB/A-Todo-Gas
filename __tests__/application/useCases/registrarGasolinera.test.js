import { RegistrarGasolineraUseCase } from "../../../src/application/useCases/registrarGasolinera.js";
import { GasolineraRepository } from "../../../src/application/ports/output/GasolineraRepository.js";
import { Gasolinera } from "../../../src/domain/entities/Gasolinera.js";

describe('RegistrarGasolineraUseCase', () => {
  // Mock del repositorio
  let mockGasolineraRepository;
  
  // Datos de prueba
  const gasolineraValida = {
    userId: 1,
    name: "Gasolinera Test",
    address: "Av. Prueba 123",
    openTime: "08:00",
    closeTime: "20:00"
  };

  beforeEach(() => {
    // Crear un mock del repositorio antes de cada test
    mockGasolineraRepository = {
      save: jest.fn().mockResolvedValue({ id: 1, ...gasolineraValida }),
      findByUserId: jest.fn().mockResolvedValue(null)
    };
  });

  it('debería registrar una gasolinera correctamente', async () => {
    // Arrange
    const useCase = new RegistrarGasolineraUseCase(mockGasolineraRepository);
    
    // Act
    const resultado = await useCase.execute(gasolineraValida);
    
    // Assert
    expect(resultado).toBeDefined();
    expect(resultado.id).toBe(1);
    expect(resultado.name).toBe(gasolineraValida.name);
    expect(mockGasolineraRepository.save).toHaveBeenCalledWith(expect.objectContaining(gasolineraValida));
  });

  it('debería rechazar una gasolinera con datos incompletos', async () => {
    // Arrange
    const useCase = new RegistrarGasolineraUseCase(mockGasolineraRepository);
    const gasolineraIncompleta = { userId: 1, name: "Gasolinera Test" };
    
    // Act & Assert
    await expect(useCase.execute(gasolineraIncompleta))
      .rejects
      .toThrow("Faltan datos obligatorios para registrar la gasolinera");
  });

  it('debería verificar si el usuario ya tiene una gasolinera registrada', async () => {
    // Arrange
    mockGasolineraRepository.findByUserId.mockResolvedValue({ id: 2, userId: 1 });
    const useCase = new RegistrarGasolineraUseCase(mockGasolineraRepository);
    
    // Act & Assert
    await expect(useCase.execute(gasolineraValida))
      .rejects
      .toThrow("El usuario ya tiene una gasolinera registrada");
  });
  it('debería lanzar un error si ya existe una gasolinera con la misma dirección', async () => {
    // Arrange
    mockGasolineraRepository.findByUserId.mockResolvedValue(null);
    mockGasolineraRepository.findByAddress = jest.fn().mockResolvedValue({ id: 3, address: gasolineraValida.address });
    const useCase = new RegistrarGasolineraUseCase(mockGasolineraRepository);
  
    // Act & Assert
    await expect(useCase.execute(gasolineraValida))
      .rejects
      .toThrow("Ya existe una gasolinera registrada con esta dirección");
  
    // Verificar que no se llamó al método save
    expect(mockGasolineraRepository.save).not.toHaveBeenCalled();
  });
  it('debería lanzar un error si el horario de apertura es mayor o igual al horario de cierre', async () => {
    // Arrange
    const gasolineraConHorarioInvalido = { ...gasolineraValida, openTime: "20:00", closeTime: "08:00" };
    const useCase = new RegistrarGasolineraUseCase(mockGasolineraRepository);
  
    // Act & Assert
    await expect(useCase.execute(gasolineraConHorarioInvalido))
      .rejects
      .toThrow("El horario de apertura debe ser menor al horario de cierre");
  
    // Verificar que no se llamó al método save
    expect(mockGasolineraRepository.save).not.toHaveBeenCalled();
  });
  it('debería lanzar un error si la validación de la gasolinera falla', async () => {
    // Arrange
    const useCase = new RegistrarGasolineraUseCase(mockGasolineraRepository);
    const gasolineraInvalida = { ...gasolineraValida, name: "" }; // Nombre vacío para forzar error
  
    // Mock de la validación para lanzar un error
    jest.spyOn(Gasolinera.prototype, 'validate').mockImplementation(() => {
      console.log("Mock de validate llamado");
      throw new Error("La validación de la gasolinera falló");
    });
  
    // Act & Assert
    await expect(useCase.execute(gasolineraInvalida))
      .rejects
      .toThrow("La validación de la gasolinera falló");
  
    // Verificar que no se llamó al método save
    expect(mockGasolineraRepository.save).not.toHaveBeenCalled();
  });
});

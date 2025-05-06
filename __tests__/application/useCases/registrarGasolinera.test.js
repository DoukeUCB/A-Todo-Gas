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
      findByUserId: jest.fn().mockResolvedValue(null),
      findByAddress: jest.fn().mockResolvedValue(null) // Añadido mock para findByAddress
    };

    // Restaurar cualquier mock de validación que se haya aplicado
    if (Gasolinera.prototype.validate.mockRestore) {
      Gasolinera.prototype.validate.mockRestore();
    }
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
    expect(mockGasolineraRepository.save).toHaveBeenCalled();
    expect(mockGasolineraRepository.findByUserId).toHaveBeenCalledWith(gasolineraValida.userId);
    expect(mockGasolineraRepository.findByAddress).toHaveBeenCalledWith(gasolineraValida.address);
  });

  it('debería rechazar una gasolinera con datos incompletos', async () => {
    // Arrange
    const useCase = new RegistrarGasolineraUseCase(mockGasolineraRepository);
    const gasolineraIncompleta = { userId: 1, name: "Gasolinera Test" };
    
    // Mock del método validate para simular error sin afectar otros tests
    jest.spyOn(Gasolinera.prototype, 'validate').mockImplementation(() => {
      throw new Error("Faltan datos obligatorios para registrar la gasolinera");
    });
    
    // Act & Assert
    await expect(useCase.execute(gasolineraIncompleta))
      .rejects
      .toThrow("La validación de la gasolinera falló: Faltan datos obligatorios para registrar la gasolinera");
      
    // Verificar que no se llamó al método save
    expect(mockGasolineraRepository.save).not.toHaveBeenCalled();
  });

  it('debería verificar si el usuario ya tiene una gasolinera registrada', async () => {
    // Arrange
    mockGasolineraRepository.findByUserId = jest.fn().mockResolvedValue({ 
      id: 2, 
      userId: gasolineraValida.userId,
      name: "Otra Gasolinera",
      address: "Otra dirección"
    });
    
    const useCase = new RegistrarGasolineraUseCase(mockGasolineraRepository);
    
    // Act & Assert
    await expect(useCase.execute(gasolineraValida))
      .rejects
      .toThrow("El usuario ya tiene una gasolinera registrada");
      
    // Verificar que no se llamó al método save
    expect(mockGasolineraRepository.save).not.toHaveBeenCalled();
  });

  it('debería lanzar un error si ya existe una gasolinera con la misma dirección', async () => {
    // Arrange
    mockGasolineraRepository.findByUserId = jest.fn().mockResolvedValue(null);
    mockGasolineraRepository.findByAddress = jest.fn().mockResolvedValue({ 
      id: 3, 
      userId: 999,
      name: "Gasolinera Existente",
      address: gasolineraValida.address 
    });
    
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
      throw new Error("El nombre no puede estar vacío");
    });
  
    // Act & Assert
    await expect(useCase.execute(gasolineraInvalida))
      .rejects
      .toThrow("La validación de la gasolinera falló: El nombre no puede estar vacío");
  
    // Verificar que no se llamó al método save
    expect(mockGasolineraRepository.save).not.toHaveBeenCalled();
  });
});

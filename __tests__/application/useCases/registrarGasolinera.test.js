import { RegistrarGasolineraUseCase } from "../../../src/application/useCases/registrarGasolinera.js";
import { GasolineraRepository } from "../../../src/application/ports/output/GasolineraRepository.js";

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
});

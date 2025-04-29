import { RegistrarNivelCombustibleUseCase } from "../../../src/application/useCases/registrarNivelCombustible.js";

describe('RegistrarNivelCombustibleUseCase', () => {
  // Mocks
  let mockNivelCombustibleRepository;
  let mockSurtidorRepository;
  
  // Datos de prueba
  const nivelCombustibleValido = {
    dispenserId: 1,
    percentage: 75
  };

  beforeEach(() => {
    mockNivelCombustibleRepository = {
      save: jest.fn().mockResolvedValue({ id: 1, ...nivelCombustibleValido, recordedAt: new Date() }),
      findByDispenserId: jest.fn().mockResolvedValue([
        { id: 1, dispenserId: 1, percentage: 80, recordedAt: new Date(Date.now() - 3600000) }
      ])
    };
    
    mockSurtidorRepository = {
      findById: jest.fn().mockResolvedValue({ id: 1, stationId: 1, identifier: 'D001' })
    };
  });

  it('debería registrar un nivel de combustible correctamente', async () => {
    // Arrange
    const useCase = new RegistrarNivelCombustibleUseCase(mockNivelCombustibleRepository, mockSurtidorRepository);
    
    // Act
    const resultado = await useCase.execute(nivelCombustibleValido);
    
    // Assert
    expect(resultado).toBeDefined();
    expect(resultado.id).toBe(1);
    expect(resultado.percentage).toBe(75);
    expect(mockNivelCombustibleRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ dispenserId: 1, percentage: 75 })
    );
  });

  it('debería rechazar un nivel de combustible con porcentaje mayor a 100', async () => {
    // Arrange
    const useCase = new RegistrarNivelCombustibleUseCase(mockNivelCombustibleRepository, mockSurtidorRepository);
    const nivelInvalido = { dispenserId: 1, percentage: 110 };
    
    // Act & Assert
    await expect(useCase.execute(nivelInvalido))
      .rejects
      .toThrow("El porcentaje debe estar entre 0 y 100");
  });

  it('debería rechazar un nivel de combustible con porcentaje negativo', async () => {
    // Arrange
    const useCase = new RegistrarNivelCombustibleUseCase(mockNivelCombustibleRepository, mockSurtidorRepository);
    const nivelInvalido = { dispenserId: 1, percentage: -10 };
    
    // Act & Assert
    await expect(useCase.execute(nivelInvalido))
      .rejects
      .toThrow("El porcentaje debe estar entre 0 y 100");
  });

  it('debería rechazar un nivel de combustible para un surtidor inexistente', async () => {
    // Arrange
    mockSurtidorRepository.findById.mockResolvedValue(null);
    const useCase = new RegistrarNivelCombustibleUseCase(mockNivelCombustibleRepository, mockSurtidorRepository);
    
    // Act & Assert
    await expect(useCase.execute(nivelCombustibleValido))
      .rejects
      .toThrow("El surtidor no existe");
  });

  it('debería obtener el historial de niveles de combustible para un surtidor', async () => {
    // Arrange
    const useCase = new RegistrarNivelCombustibleUseCase(mockNivelCombustibleRepository, mockSurtidorRepository);
    
    // Act
    const historial = await useCase.obtenerHistorial(1);
    
    // Assert
    expect(historial).toHaveLength(1);
    expect(historial[0].dispenserId).toBe(1);
    expect(historial[0].percentage).toBe(80);
    expect(mockNivelCombustibleRepository.findByDispenserId).toHaveBeenCalledWith(1);
  });

  it('debería obtener el último nivel registrado para un surtidor', async () => {
    // Arrange
    mockNivelCombustibleRepository.findByDispenserId.mockResolvedValue([
      { id: 1, dispenserId: 1, percentage: 80, recordedAt: new Date(Date.now() - 3600000) },
      { id: 2, dispenserId: 1, percentage: 75, recordedAt: new Date() }
    ]);
    const useCase = new RegistrarNivelCombustibleUseCase(mockNivelCombustibleRepository, mockSurtidorRepository);
    
    // Act
    const ultimoNivel = await useCase.obtenerUltimoNivel(1);
    
    // Assert
    expect(ultimoNivel).toBeDefined();
    expect(ultimoNivel.percentage).toBe(75);
    expect(mockNivelCombustibleRepository.findByDispenserId).toHaveBeenCalledWith(1);
  });
});

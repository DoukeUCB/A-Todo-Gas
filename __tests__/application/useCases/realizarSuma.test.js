import { RealizarSumaUseCase } from "../../../src/application/useCases/realizarSuma";

describe('RealizarSumaUseCase', () => {
  it('debería sumar dos números correctamente', () => {
    // Arrange
    const mockCalculadoraService = {
      sumar: jest.fn((a, b) => a + b)
    };
    const realizarSuma = new RealizarSumaUseCase(mockCalculadoraService);
    
    // Act
    const resultado = realizarSuma.execute(5, 3);
    
    // Assert
    expect(resultado).toBe(8);
    expect(mockCalculadoraService.sumar).toHaveBeenCalledWith(5, 3);
  });
});

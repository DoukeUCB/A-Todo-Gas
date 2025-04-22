import { CalculadoraService } from "../../../src/domain/services/CalculadoraService";

describe('CalculadoraService', () => {
  it('debería sumar dos números', () => {
    // Arrange
    const calculadoraService = new CalculadoraService();
    
    // Act
    const resultado = calculadoraService.sumar(3, 2);
    
    // Assert
    expect(resultado).toBe(5);
  });
});

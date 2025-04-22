import { CalculadoraService } from "../../domain/services/CalculadoraService";

// Los casos de uso no deben extender los puertos, sino implementarlos
export class RealizarSumaUseCase {
  constructor() {
    this.calculadoraService = new CalculadoraService();
  }

  execute(primerNumero, segundoNumero) {
    return this.calculadoraService.sumar(primerNumero, segundoNumero);
  }
}

export const realizarSuma = new RealizarSumaUseCase();

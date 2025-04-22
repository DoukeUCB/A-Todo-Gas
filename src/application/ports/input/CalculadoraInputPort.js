// Los puertos son interfaces (contratos) que definen métodos
export class CalculadoraInputPort {
  execute(primerNumero, segundoNumero) {
    throw new Error("Este método debe ser implementado por un caso de uso");
  }
}

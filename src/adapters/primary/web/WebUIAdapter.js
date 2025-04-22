export class WebUIAdapter {
  constructor(sumaUseCase) {
    this.sumaUseCase = sumaUseCase;
    this.elements = {
      first: null,
      second: null,
      form: null,
      resultDiv: null
    };
  }

  init() {
    this.bindDOMElements();
    this.setupEventListeners();
  }

  bindDOMElements() {
    this.elements.first = document.querySelector("#primer-numero");
    this.elements.second = document.querySelector("#segundo-numero");
    this.elements.form = document.querySelector("#form");
    this.elements.resultDiv = document.querySelector("#resultado-div");
  }

  setupEventListeners() {
    this.elements.form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.handleSubmit();
    });
  }

  handleSubmit() {
    const firstNumber = Number.parseInt(this.elements.first.value);
    const secondNumber = Number.parseInt(this.elements.second.value);

    // Usar el método execute del caso de uso
    const resultado = this.sumaUseCase.execute(firstNumber, secondNumber);
    this.updateUI(resultado);
  }

  updateUI(resultado) {
    this.elements.resultDiv.innerHTML = "<p>" + resultado + "</p>";
  }
}

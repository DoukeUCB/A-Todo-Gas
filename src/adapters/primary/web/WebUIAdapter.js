export class WebUIAdapter {
  constructor(registrarGasolineraUseCase) {
    this.registrarGasolineraUseCase = registrarGasolineraUseCase;
    this.elements = {
      registroForm: null,
      userId: null,
      nombre: null,
      direccion: null,
      horaApertura: null,
      horaCierre: null,
      mensaje: null
    };
  }

  init() {
    this.bindDOMElements();
    this.setupEventListeners();
  }

  bindDOMElements() {
    this.elements.registroForm = document.querySelector("#registro-gasolinera-form");
    this.elements.userId = document.querySelector("#user-id");
    this.elements.nombre = document.querySelector("#nombre-gasolinera");
    this.elements.direccion = document.querySelector("#direccion-gasolinera");
    this.elements.horaApertura = document.querySelector("#hora-apertura");
    this.elements.horaCierre = document.querySelector("#hora-cierre");
    this.elements.mensaje = document.querySelector("#mensaje-resultado");
  }

  setupEventListeners() {
    this.elements.registroForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.handleSubmit();
    });
  }

  async handleSubmit() {
    try {
      this.updateUI("Procesando...", "info");
      
      const gasolineraData = {
        userId: Number(this.elements.userId.value),
        name: this.elements.nombre.value,
        address: this.elements.direccion.value,
        openTime: this.elements.horaApertura.value,
        closeTime: this.elements.horaCierre.value
      };

      // Llamar al caso de uso de forma asíncrona
      const resultado = await this.registrarGasolineraUseCase.execute(gasolineraData);
      
      this.updateUI(`Gasolinera registrada exitosamente. ID: ${resultado.id}`, "success");
      this.elements.registroForm.reset();
    } catch (error) {
      this.updateUI(`Error: ${error.message}`, "error");
    }
  }

  updateUI(mensaje, tipo) {
    this.elements.mensaje.textContent = mensaje;
    this.elements.mensaje.className = `mensaje ${tipo}`;
  }
}

export class WebUIAdapter {
  constructor() {
    this.apiUrl = 'http://localhost:3000/api';
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
    console.log("Iniciando WebUIAdapter...");
    this.bindDOMElements();
    
    if (!this.elements.registroForm) {
      console.error("No se encontró el formulario con ID: registro-gasolinera-form");
      // Intentar buscar el formulario de otras maneras
      const forms = document.querySelectorAll('form');
      console.log(`Formularios encontrados en la página: ${forms.length}`);
      forms.forEach((form, index) => {
        console.log(`Formulario #${index}:`, form);
      });
      return;
    }
    
    console.log("Formulario encontrado, configurando eventos...");
    this.setupEventListeners();
  }

  bindDOMElements() {
    // Intentar diferentes métodos de selección para diagnóstico
    console.log("Intentando vincular elementos DOM usando getElementById...");
    this.elements.registroForm = document.getElementById("registro-gasolinera-form");
    
    if (!this.elements.registroForm) {
      console.log("Intentando vincular usando querySelector...");
      this.elements.registroForm = document.querySelector("#registro-gasolinera-form");
      
      if (!this.elements.registroForm) {
        console.log("Intentando vincular cualquier formulario...");
        this.elements.registroForm = document.querySelector("form");
      }
    }
    
    // Vincular el resto de elementos solo si encontramos el formulario
    if (this.elements.registroForm) {
      console.log("Formulario encontrado:", this.elements.registroForm);
      this.elements.userId = document.getElementById("user-id");
      this.elements.nombre = document.getElementById("nombre-gasolinera");
      this.elements.direccion = document.getElementById("direccion-gasolinera");
      this.elements.horaApertura = document.getElementById("hora-apertura");
      this.elements.horaCierre = document.getElementById("hora-cierre");
      this.elements.mensaje = document.getElementById("mensaje-resultado");
    }
    
    // Log para depuración
    console.log("Elementos del DOM:", {
      form: this.elements.registroForm,
      userId: this.elements.userId,
      nombre: this.elements.nombre,
      direccion: this.elements.direccion,
      horaApertura: this.elements.horaApertura,
      horaCierre: this.elements.horaCierre,
      mensaje: this.elements.mensaje
    });
  }

  setupEventListeners() {
    console.log("Configurando evento submit para el formulario");
    this.elements.registroForm.addEventListener("submit", (event) => {
      console.log("Evento submit interceptado");
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
      
      console.log("Datos a enviar:", gasolineraData);

      // Llamar a la API REST en lugar de usar directamente el caso de uso
      const response = await fetch(`${this.apiUrl}/gasolineras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gasolineraData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar la gasolinera');
      }
      
      const resultado = await response.json();
      
      console.log("Resultado de la API:", resultado);
      
      this.updateUI(`Gasolinera registrada exitosamente. ID: ${resultado.id}`, "success");
      this.elements.registroForm.reset();
    } catch (error) {
      console.error("Error al registrar gasolinera:", error);
      this.updateUI(`Error: ${error.message}`, "error");
    }
  }

  updateUI(mensaje, tipo) {
    console.log(`Actualizando UI: ${mensaje} (${tipo})`);
    if (this.elements.mensaje) {
      this.elements.mensaje.textContent = mensaje;
      this.elements.mensaje.className = `mensaje ${tipo}`;
    } else {
      console.error("No se encontró el elemento para mostrar mensajes");
      alert(mensaje);
    }
  }
}

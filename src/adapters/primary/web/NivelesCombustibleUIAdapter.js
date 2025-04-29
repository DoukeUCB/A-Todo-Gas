export class NivelesCombustibleUIAdapter {
  constructor(registrarNivelUseCase, obtenerHistorialUseCase) {
    this.registrarNivelUseCase = registrarNivelUseCase;
    this.obtenerHistorialUseCase = obtenerHistorialUseCase;
    this.elements = {
      selectGasolinera: null,
      selectSurtidor: null,
      porcentajeNivel: null,
      valorPorcentaje: null,
      formNivel: null,
      mensajeResultado: null,
      tablaHistorial: null,
      historialChart: null
    };
    this.chart = null;
  }

  init() {
    this.bindDOMElements();
    this.setupEventListeners();
    this.cargarGasolineras(); // Simulado por ahora
  }

  bindDOMElements() {
    this.elements.selectGasolinera = document.querySelector("#select-gasolinera");
    this.elements.selectSurtidor = document.querySelector("#select-surtidor");
    this.elements.porcentajeNivel = document.querySelector("#porcentaje-nivel");
    this.elements.valorPorcentaje = document.querySelector("#valor-porcentaje");
    this.elements.formNivel = document.querySelector("#form-nivel-combustible");
    this.elements.mensajeResultado = document.querySelector("#mensaje-resultado");
    this.elements.tablaHistorial = document.querySelector("#tabla-historial tbody");
    this.elements.historialChart = document.querySelector("#historial-chart");
  }

  setupEventListeners() {
    // Actualizar texto del porcentaje al mover el slider
    this.elements.porcentajeNivel.addEventListener("input", () => {
      this.elements.valorPorcentaje.textContent = `${this.elements.porcentajeNivel.value}%`;
    });

    // Manejar cambio de gasolinera
    this.elements.selectGasolinera.addEventListener("change", () => {
      this.cargarSurtidores(this.elements.selectGasolinera.value);
    });

    // Manejar cambio de surtidor
    this.elements.selectSurtidor.addEventListener("change", () => {
      if (this.elements.selectSurtidor.value) {
        this.cargarHistorial(this.elements.selectSurtidor.value);
      }
    });

    // Manejar envío del formulario
    this.elements.formNivel.addEventListener("submit", async (event) => {
      event.preventDefault();
      await this.handleSubmit();
    });
  }

  async handleSubmit() {
    const dispenserId = this.elements.selectSurtidor.value;
    const percentage = parseInt(this.elements.porcentajeNivel.value);
    
    if (!dispenserId) {
      this.updateUI("Debe seleccionar un surtidor", "error");
      return;
    }
    
    try {
      this.updateUI("Procesando...", "info");
      
      await this.registrarNivelUseCase.execute(dispenserId, percentage);
      
      this.updateUI("Nivel de combustible registrado correctamente", "success");
      
      // Recargar el historial
      await this.cargarHistorial(dispenserId);
    } catch (error) {
      this.updateUI(`Error: ${error.message}`, "error");
    }
  }

  updateUI(mensaje, tipo) {
    this.elements.mensajeResultado.textContent = mensaje;
    this.elements.mensajeResultado.className = `mensaje ${tipo}`;
  }

  // Método provisional para cargar gasolineras (simula una llamada a la API)
  cargarGasolineras() {
    const gasolineras = [
      { id: 1, name: "Gasolinera Central" },
      { id: 2, name: "Gasolinera Norte" }
    ];
    
    this.elements.selectGasolinera.innerHTML = '<option value="">Seleccione una gasolinera</option>';
    
    gasolineras.forEach(gasolinera => {
      const option = document.createElement("option");
      option.value = gasolinera.id;
      option.textContent = gasolinera.name;
      this.elements.selectGasolinera.appendChild(option);
    });
  }

  // Método provisional para cargar surtidores (simula una llamada a la API)
  cargarSurtidores(gasolineraId) {
    const surtidores = [
      { id: 1, identifier: "Surtidor 1", stationId: 1 },
      { id: 2, identifier: "Surtidor 2", stationId: 1 },
      { id: 3, identifier: "Surtidor 1", stationId: 2 }
    ].filter(s => s.stationId === parseInt(gasolineraId));
    
    this.elements.selectSurtidor.innerHTML = '<option value="">Seleccione un surtidor</option>';
    
    surtidores.forEach(surtidor => {
      const option = document.createElement("option");
      option.value = surtidor.id;
      option.textContent = surtidor.identifier;
      this.elements.selectSurtidor.appendChild(option);
    });
  }

  // Método para cargar el historial de niveles
  async cargarHistorial(dispenserId) {
    try {
      const historial = await this.obtenerHistorialUseCase.execute(dispenserId);
      
      // Limpiar tabla
      this.elements.tablaHistorial.innerHTML = '';
      
      // Rellenar tabla con datos
      historial.forEach(nivel => {
        const fecha = new Date(nivel.recordedAt);
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${fecha.toLocaleString()}</td>
          <td>${nivel.percentage}%</td>
        `;
        this.elements.tablaHistorial.appendChild(row);
      });
      
      // Actualizar gráfica
      this.actualizarGrafica(historial);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  }

  // Método para actualizar la gráfica
  actualizarGrafica(historial) {
    // Preparar datos para Chart.js
    const labels = historial.map(item => {
      const fecha = new Date(item.recordedAt);
      return fecha.toLocaleString();
    }).reverse(); // Más antiguo primero
    
    const datos = historial.map(item => item.percentage).reverse();
    
    if (this.chart) {
      // Actualizar gráfica existente
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = datos;
      this.chart.update();
    } else {
      // Crear nueva gráfica
      this.chart = new Chart(this.elements.historialChart, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Nivel de combustible (%)',
            data: datos,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });
    }
  }
}

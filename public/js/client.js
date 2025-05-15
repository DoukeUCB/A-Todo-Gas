// Este archivo se ejecutará en el navegador para inicializar la aplicación cliente

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Verificar que window.QuickGasoline existe
    if (!window.QuickGasoline) {
      throw new Error('No se ha cargado el módulo QuickGasoline. Asegúrate de que bundle.js se carga correctamente.');
    }
    
    // Verificar que initializeApp es una función
    if (typeof window.QuickGasoline.initializeApp !== 'function') {
      throw new Error('La función initializeApp no está definida en el módulo QuickGasoline.');
    }
    
    // Iniciar la aplicación con el elemento raíz 'app'
    const app = window.QuickGasoline.initializeApp('app');
    console.log('Aplicación inicializada correctamente');
    
  } catch (error) {
    console.error('Error al inicializar la aplicación cliente:', error);
    // Mostrar mensaje de error al usuario
    const appElement = document.getElementById('app');
    if (appElement) {
      appElement.innerHTML = `
        <div class="error-container" style="color: red; padding: 20px; border: 1px solid red; margin: 20px; border-radius: 5px;">
          <h2>Error</h2>
          <p>Ha ocurrido un error al cargar la aplicación:</p>
          <pre>${error.message}</pre>
          <p>Revisa la consola del navegador para más detalles.</p>
        </div>
      `;
    }
  }
});

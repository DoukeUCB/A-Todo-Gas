import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getConnection } from './src/config/database.js';
import { MysqlGasolineraRepository } from './src/adapters/secondary/mysql/MysqlGasolineraRepository.js';
import { RegistrarGasolineraUseCase } from './src/application/useCases/registrarGasolinera.js';

// Configuración de directorios para servir archivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Inicializar repositorio y caso de uso
let gasolineraRepository;
let registrarGasolineraUseCase;

// Inicializar dependencias
async function initDependencies() {
  try {
    console.log('Inicializando dependencias del servidor...');
    const connection = await getConnection();
    gasolineraRepository = new MysqlGasolineraRepository(connection);
    registrarGasolineraUseCase = new RegistrarGasolineraUseCase(gasolineraRepository);
    console.log('Dependencias inicializadas correctamente');
  } catch (error) {
    console.error('Error al inicializar dependencias:', error);
    process.exit(1);
  }
}

// Endpoint para registrar gasolinera
app.post('/api/gasolineras', async (req, res) => {
  try {
    const resultado = await registrarGasolineraUseCase.execute(req.body);
    res.status(201).json(resultado);
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(400).json({ error: error.message });
  }
});

// Iniciar el servidor
initDependencies().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
  });
});

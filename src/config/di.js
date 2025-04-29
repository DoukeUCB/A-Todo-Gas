// Configuración de dependencias
import { getConnection } from './database.js';
import { MysqlGasolineraRepository } from "../adapters/secondary/mysql/MysqlGasolineraRepository.js";
import { RegistrarGasolineraUseCase } from "../application/useCases/registrarGasolinera.js";
import { MysqlNivelCombustibleRepository } from "../adapters/secondary/mysql/MysqlNivelCombustibleRepository.js";
import { RegistrarNivelCombustibleUseCase } from "../application/useCases/registrarNivelCombustible.js";
import { ObtenerHistorialNivelesUseCase } from "../application/useCases/obtenerHistorialNiveles.js";

// Inicializar conexión a base de datos y repositorios
let mysqlGasolineraRepository;
let registrarGasolineraUseCase;
let mysqlNivelCombustibleRepository;
let registrarNivelCombustibleUseCase;
let obtenerHistorialNivelesUseCase;

const initDatabaseDependencies = async () => {
  try {
    const connection = await getConnection();
    // Repositorios y casos de uso para gasolinera
    mysqlGasolineraRepository = new MysqlGasolineraRepository(connection);
    registrarGasolineraUseCase = new RegistrarGasolineraUseCase(mysqlGasolineraRepository);
    
    // Repositorios y casos de uso para niveles de combustible
    mysqlNivelCombustibleRepository = new MysqlNivelCombustibleRepository(connection);
    registrarNivelCombustibleUseCase = new RegistrarNivelCombustibleUseCase(mysqlNivelCombustibleRepository);
    obtenerHistorialNivelesUseCase = new ObtenerHistorialNivelesUseCase(mysqlNivelCombustibleRepository);
  } catch (error) {
    console.error("Error al inicializar dependencias de base de datos:", error);
  }
};

// Inicializar de forma asíncrona
initDatabaseDependencies();

export {
  registrarGasolineraUseCase,
  registrarNivelCombustibleUseCase,
  obtenerHistorialNivelesUseCase
};

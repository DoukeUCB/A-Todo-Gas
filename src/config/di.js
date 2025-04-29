// Configuración de dependencias
import { getConnection } from './database.js';
import { MysqlGasolineraRepository } from "../adapters/secondary/mysql/MysqlGasolineraRepository.js";
import { RegistrarGasolineraUseCase } from "../application/useCases/registrarGasolinera.js";

// Inicializar conexión a base de datos y repositorios
let mysqlGasolineraRepository;
let registrarGasolineraUseCase;

const initDatabaseDependencies = async () => {
  try {
    const connection = await getConnection();
    mysqlGasolineraRepository = new MysqlGasolineraRepository(connection);
    registrarGasolineraUseCase = new RegistrarGasolineraUseCase(mysqlGasolineraRepository);
  } catch (error) {
    console.error("Error al inicializar dependencias de base de datos:", error);
  }
};

// Inicializar de forma asíncrona
initDatabaseDependencies();

export {
  registrarGasolineraUseCase
};

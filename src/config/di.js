// Configuración de dependencias
import { getConnection } from './database.js';
import { MysqlGasolineraRepository } from "../adapters/secondary/mysql/MysqlGasolineraRepository.js";
import { RegistrarGasolineraUseCase } from "../application/useCases/registrarGasolinera.js";

// Variables para almacenar instancias
let _connection = null;
let _mysqlGasolineraRepository = null;
let _registrarGasolineraUseCase = null;
let _initialized = false;
let _initializing = false;
let _initPromise = null;

// Función para inicializar las dependencias de forma asíncrona
async function initDependencies() {
  if (_initialized) {
    console.log("Las dependencias ya están inicializadas");
    return {
      success: true,
      registrarGasolineraUseCase: _registrarGasolineraUseCase
    };
  }
  
  if (_initializing) {
    console.log("Las dependencias ya se están inicializando, esperando...");
    return _initPromise;
  }
  
  console.log("Comenzando inicialización de dependencias...");
  _initializing = true;
  
  _initPromise = new Promise(async (resolve) => {
    try {
      console.log("Obteniendo conexión a la base de datos...");
      _connection = await getConnection();
      
      console.log("Creando repositorio de gasolineras...");
      _mysqlGasolineraRepository = new MysqlGasolineraRepository(_connection);
      
      console.log("Creando caso de uso de registro de gasolinera...");
      _registrarGasolineraUseCase = new RegistrarGasolineraUseCase(_mysqlGasolineraRepository);
      
      _initialized = true;
      console.log("Dependencias inicializadas correctamente");
      resolve({
        success: true,
        registrarGasolineraUseCase: _registrarGasolineraUseCase
      });
    } catch (error) {
      console.error("Error al inicializar dependencias:", error);
      resolve({
        success: false,
        error: error.message
      });
    } finally {
      _initializing = false;
    }
  });
  
  return _initPromise;
}

// Función para obtener las dependencias
export async function getDependencias() {
  return await initDependencies();
}

// También exportamos el caso de uso directamente para compatibilidad
export const registrarGasolineraUseCase = {
  // Proxy que delegará las llamadas al caso de uso real cuando esté inicializado
  execute: async function(data) {
    console.log("Proxy de caso de uso llamado, inicializando dependencias si es necesario...");
    const { success, registrarGasolineraUseCase, error } = await getDependencias();
    
    if (!success) {
      console.error("Error al inicializar dependencias:", error);
      throw new Error(`No se pudo inicializar el caso de uso: ${error}`);
    }
    
    console.log("Delegando al caso de uso real...");
    return await registrarGasolineraUseCase.execute(data);
  }
};

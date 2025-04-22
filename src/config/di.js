// Configuración de dependencias
import { RealizarSumaUseCase } from "../application/useCases/realizarSuma";
import { CalculadoraService } from "../domain/services/CalculadoraService";
import { LocalStorageAdapter } from "../adapters/secondary/persistencia/LocalStorageAdapter";

// Crear instancias y configurar sus dependencias
const persistenciaAdapter = new LocalStorageAdapter();
const calculadoraService = new CalculadoraService();
const realizarSumaUseCase = new RealizarSumaUseCase(calculadoraService, persistenciaAdapter);

export { realizarSumaUseCase };

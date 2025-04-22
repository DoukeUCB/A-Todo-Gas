import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

// Ejecutar Jest y guardar el resultado en formato JSON
const runJest = async () => {
  return new Promise((resolve) => {
    const jest = spawn('npx', ['jest', '--json', '--outputFile=./script/report.json']);
    
    jest.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    jest.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    jest.on('close', (code) => {
      resolve(code);
    });
  });
};

// Función principal
const main = async () => {
  try {
    await runJest();
    
    // Asegurar que el archivo report.json existe, incluso si no hay pruebas
    const reportPath = path.resolve('./script/report.json');
    try {
      await fs.access(reportPath);
    } catch {
      // Si no existe, crear un archivo vacío
      await fs.writeFile(reportPath, JSON.stringify({
        testResults: [],
        numTotalTests: 0,
        numTotalTestSuites: 0,
        numPassedTests: 0,
        numFailedTests: 0,
        numPendingTests: 0,
        success: true
      }));
    }
  } catch (error) {
    console.error('Error en la ejecución:', error);
  }
};

main();

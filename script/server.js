import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  default: 'application/octet-stream',
  html: 'text/html; charset=UTF-8',
  js: 'application/javascript',
  css: 'text/css',
};

const PUBLIC_PATH = path.join(__dirname, '../public');

const server = http.createServer((req, res) => {
  console.log(`Solicitud para: ${req.url}`);
  
  // Manejar la ruta raíz
  const url = req.url === '/' ? '/index.html' : req.url;
  
  // Obtener la ruta del archivo
  const filePath = path.join(PUBLIC_PATH, url);
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname.substring(1)] || MIME_TYPES.default;
  
  // Servir el archivo
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Si el archivo no existe, servir un 404
        res.writeHead(404);
        res.end('Archivo no encontrado');
      } else {
        // Error de servidor
        res.writeHead(500);
        res.end(`Error de servidor: ${error.code}`);
      }
    } else {
      // Éxito - devolver el archivo
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/`);
  console.log(`Sirviendo archivos desde ${PUBLIC_PATH}`);
});

require('dotenv').config();

module.exports = {
  // Usando variable de entorno para no exponer la contraseña en el código
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://quickgasoline:<db_password>@clusteringsoft.qf1dr0o.mongodb.net/quickGasoline_db?retryWrites=true&w=majority&appName=ClusterIngSoft',
  DB_NAME: 'quickGasoline_db'
};

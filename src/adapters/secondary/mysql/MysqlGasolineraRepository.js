import { GasolineraRepository } from "../../../application/ports/output/GasolineraRepository.js";
import { Gasolinera } from "../../../domain/entities/Gasolinera.js";

export class MysqlGasolineraRepository extends GasolineraRepository {
  constructor(connection) {
    super();
    this.connection = connection;
  }

  async save(gasolinera) {
    const query = 'INSERT INTO stations (user_id, name, address, open_time, close_time) VALUES (?, ?, ?, ?, ?)';
    const values = [gasolinera.userId, gasolinera.name, gasolinera.address, gasolinera.openTime, gasolinera.closeTime];
    
    console.log("Ejecutando consulta INSERT:", query);
    console.log("Valores:", values);
    
    try {
      const [result] = await this.connection.execute(query, values);
      console.log("Resultado INSERT:", result);
      
      if (!result || !result.insertId) {
        throw new Error("No se pudo obtener el ID de la gasolinera insertada");
      }
      
      console.log(`Gasolinera guardada con ID: ${result.insertId}`);
      return {
        id: result.insertId,
        ...gasolinera
      };
    } catch (error) {
      console.error("Error SQL al guardar la gasolinera:", error);
      // Verificar si es un error de clave foránea
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error(`El usuario con ID ${gasolinera.userId} no existe`);
      }
      throw new Error(`Error al guardar la gasolinera: ${error.message}`);
    }
  }

  async findByUserId(userId) {
    const query = 'SELECT * FROM stations WHERE user_id = ?';
    
    try {
      const [rows] = await this.connection.execute(query, [userId]);
      if (rows.length === 0) {
        return null;
      }
      
      const station = rows[0];
      return new Gasolinera(
        station.user_id,
        station.name,
        station.address,
        station.open_time,
        station.close_time,
        station.id
      );
    } catch (error) {
      throw new Error(`Error al buscar gasolinera por usuario: ${error.message}`);
    }
  }
  
  async findByAddress(address) {
    const query = 'SELECT * FROM stations WHERE address = ?';
    
    try {
      const [rows] = await this.connection.execute(query, [address]);
      if (rows.length === 0) {
        return null;
      }
      
      const station = rows[0];
      return new Gasolinera(
        station.user_id,
        station.name,
        station.address,
        station.open_time,
        station.close_time,
        station.id
      );
    } catch (error) {
      throw new Error(`Error al buscar gasolinera por dirección: ${error.message}`);
    }
  }
}

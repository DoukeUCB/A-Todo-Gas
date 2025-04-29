import { GasolineraRepository } from "../../../application/ports/output/GasolineraRepository.js";
import { Gasolinera } from "../../../domain/entities/Gasolinera.js";

export class MysqlGasolineraRepository extends GasolineraRepository {
  constructor(connection) {
    super();
    this.connection = connection;
  }

  async save(gasolinera) {
    // Por ahora, solo implementamos lo mínimo para pasar el test
    const query = 'INSERT INTO stations (user_id, name, address, open_time, close_time) VALUES (?, ?, ?, ?, ?)';
    const values = [gasolinera.userId, gasolinera.name, gasolinera.address, gasolinera.openTime, gasolinera.closeTime];
    
    try {
      const [result] = await this.connection.execute(query, values);
      return {
        id: result.insertId,
        ...gasolinera
      };
    } catch (error) {
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
}

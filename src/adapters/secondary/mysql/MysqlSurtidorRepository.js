import { SurtidorRepository } from "../../../application/ports/output/SurtidorRepository.js";

export class MysqlSurtidorRepository extends SurtidorRepository {
  constructor(connection) {
    super();
    this.connection = connection;
  }

  async findById(id) {
    const query = 'SELECT * FROM dispensers WHERE id = ?';
    
    try {
      const [rows] = await this.connection.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      throw new Error(`Error al buscar surtidor: ${error.message}`);
    }
  }

  async findByStationId(stationId) {
    const query = 'SELECT * FROM dispensers WHERE station_id = ?';
    
    try {
      const [rows] = await this.connection.execute(query, [stationId]);
      return rows;
    } catch (error) {
      throw new Error(`Error al buscar surtidores por estación: ${error.message}`);
    }
  }
}

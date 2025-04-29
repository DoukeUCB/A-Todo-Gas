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
      
      const dispenser = rows[0];
      return {
        id: dispenser.id,
        stationId: dispenser.station_id,
        identifier: dispenser.identifier,
        description: dispenser.description
      };
    } catch (error) {
      throw new Error(`Error al buscar surtidor por ID: ${error.message}`);
    }
  }

  async findByStationId(stationId) {
    const query = 'SELECT * FROM dispensers WHERE station_id = ?';
    
    try {
      const [rows] = await this.connection.execute(query, [stationId]);
      return rows.map(dispenser => ({
        id: dispenser.id,
        stationId: dispenser.station_id,
        identifier: dispenser.identifier,
        description: dispenser.description
      }));
    } catch (error) {
      throw new Error(`Error al buscar surtidores por estación: ${error.message}`);
    }
  }

  async save(surtidor) {
    const query = 'INSERT INTO dispensers (station_id, identifier, description) VALUES (?, ?, ?)';
    const values = [surtidor.stationId, surtidor.identifier, surtidor.description];
    
    try {
      const [result] = await this.connection.execute(query, values);
      return {
        id: result.insertId,
        ...surtidor
      };
    } catch (error) {
      throw new Error(`Error al guardar el surtidor: ${error.message}`);
    }
  }
}

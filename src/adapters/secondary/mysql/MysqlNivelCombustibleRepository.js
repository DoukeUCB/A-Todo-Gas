import { NivelCombustibleRepository } from "../../../application/ports/output/NivelCombustibleRepository.js";

export class MysqlNivelCombustibleRepository extends NivelCombustibleRepository {
  constructor(connection) {
    super();
    this.connection = connection;
  }

  async save(nivelCombustible) {
    const query = 'INSERT INTO fuel_levels (dispenser_id, percentage, recorded_at) VALUES (?, ?, ?)';
    const values = [
      nivelCombustible.dispenserId, 
      nivelCombustible.percentage, 
      nivelCombustible.recordedAt
    ];
    
    try {
      const [result] = await this.connection.execute(query, values);
      return {
        id: result.insertId,
        ...nivelCombustible
      };
    } catch (error) {
      throw new Error(`Error al guardar el nivel de combustible: ${error.message}`);
    }
  }

  async findByDispenserId(dispenserId) {
    const query = 'SELECT * FROM fuel_levels WHERE dispenser_id = ? ORDER BY recorded_at DESC';
    
    try {
      const [rows] = await this.connection.execute(query, [dispenserId]);
      return rows.map(row => ({
        id: row.id,
        dispenserId: row.dispenser_id,
        percentage: row.percentage,
        recordedAt: row.recorded_at
      }));
    } catch (error) {
      throw new Error(`Error al buscar niveles de combustible: ${error.message}`);
    }
  }

  async findById(id) {
    const query = 'SELECT * FROM fuel_levels WHERE id = ?';
    
    try {
      const [rows] = await this.connection.execute(query, [id]);
      if (rows.length === 0) {
        return null;
      }
      
      const row = rows[0];
      return {
        id: row.id,
        dispenserId: row.dispenser_id,
        percentage: row.percentage,
        recordedAt: row.recorded_at
      };
    } catch (error) {
      throw new Error(`Error al buscar nivel de combustible: ${error.message}`);
    }
  }
}

/**
 * Interfaz para el repositorio de usuarios
 * Define los métodos que deben ser implementados por cualquier adaptador de persistencia
 */
class IUserRepository {
  async findById(id) {
    throw new Error('Method not implemented');
  }
  
  async findByCI(ci) {
    throw new Error('Method not implemented');
  }
  
  async findByEmail(email) {
    throw new Error('Method not implemented');
  }
  
  async create(userData) {
    throw new Error('Method not implemented');
  }
  
  async update(id, userData) {
    throw new Error('Method not implemented');
  }
  
  async delete(id) {
    throw new Error('Method not implemented');
  }
}

module.exports = IUserRepository;

const GasStation = require('../../../src/domain/entities/GasStation');

describe('GasStation Entity', () => {
  test('debería crear una estación de gasolina válida', () => {
    const now = new Date();
    const openTime = new Date(now);
    openTime.setHours(8, 0, 0); // 8:00 AM
    
    const closeTime = new Date(now);
    closeTime.setHours(20, 0, 0); // 8:00 PM
    
    const stationData = {
      id: '123456',
      stationNumber: 42,
      name: 'Estación Central',
      address: 'Av. Principal #123',
      openTime,
      closeTime,
      managerCi: '87654321'
    };
    
    const station = new GasStation(stationData);
    
    expect(station.id).toBe(stationData.id);
    expect(station.stationNumber).toBe(stationData.stationNumber);
    expect(station.name).toBe(stationData.name);
    expect(station.address).toBe(stationData.address);
    expect(station.openTime).toEqual(openTime);
    expect(station.closeTime).toEqual(closeTime);
    expect(station.managerCi).toBe(stationData.managerCi);
  });
  
  test('debería convertir stationNumber de string a número', () => {
    const now = new Date();
    const openTime = new Date(now);
    openTime.setHours(8, 0, 0);
    
    const closeTime = new Date(now);
    closeTime.setHours(20, 0, 0);
    
    const stationData = {
      id: '123456',
      stationNumber: '42', // Como string
      name: 'Estación Central',
      address: 'Av. Principal #123',
      openTime,
      closeTime,
      managerCi: '87654321'
    };
    
    const station = new GasStation(stationData);
    
    expect(typeof station.stationNumber).toBe('number');
    expect(station.stationNumber).toBe(42);
  });
  
  test('debería lanzar error con horarios inválidos', () => {
    const now = new Date();
    const openTime = new Date(now);
    openTime.setHours(20, 0, 0); // 8:00 PM
    
    const closeTime = new Date(now);
    closeTime.setHours(8, 0, 0); // 8:00 AM - Antes que openTime
    
    const stationData = {
      id: '123456',
      stationNumber: 42,
      name: 'Estación Central',
      address: 'Av. Principal #123',
      openTime,
      closeTime, // Cierre antes de apertura
      managerCi: '87654321'
    };
    
    expect(() => new GasStation(stationData)).toThrow(/hora de cierre debe ser posterior/);
  });
  
  test('debería lanzar error con número de estación inválido', () => {
    const now = new Date();
    const openTime = new Date(now);
    openTime.setHours(8, 0, 0);
    
    const closeTime = new Date(now);
    closeTime.setHours(20, 0, 0);
    
    const stationData = {
      id: '123456',
      stationNumber: -5, // Número negativo
      name: 'Estación Central',
      address: 'Av. Principal #123',
      openTime,
      closeTime,
      managerCi: '87654321'
    };
    
    expect(() => new GasStation(stationData)).toThrow(/número de estación/);
  });
});

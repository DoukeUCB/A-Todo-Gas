const Ticket = require('../../../src/domain/entities/Ticket');

describe('Ticket Entity', () => {
  test('debería crear un ticket válido', () => {
    const ticketData = {
      id: '123456',
      ci: '12345678',
      plate: 'ABC-123',
      ticketNumber: 42,
      stationId: '987654',
      stationName: 'Estación Central',
      createdAt: new Date()
    };
    
    const ticket = new Ticket(ticketData);
    
    expect(ticket).toMatchObject(ticketData);
  });
  
  test('debería establecer createdAt como fecha actual si no se proporciona', () => {
    const beforeTest = new Date();
    
    const ticketData = {
      id: '123456',
      ci: '12345678',
      plate: 'ABC-123',
      ticketNumber: 42,
      stationId: '987654',
      stationName: 'Estación Central'
      // Sin createdAt
    };
    
    const ticket = new Ticket(ticketData);
    const afterTest = new Date();
    
    expect(ticket.createdAt).toBeInstanceOf(Date);
    expect(ticket.createdAt >= beforeTest).toBeTruthy();
    expect(ticket.createdAt <= afterTest).toBeTruthy();
  });
  
  test('debería lanzar error con matrícula inválida', () => {
    const ticketData = {
      id: '123456',
      ci: '12345678',
      plate: 'abc-123', // Minúsculas, no válidas
      ticketNumber: 42,
      stationId: '987654',
      stationName: 'Estación Central',
      createdAt: new Date()
    };
    
    expect(() => new Ticket(ticketData)).toThrow(/matrícula es requerida/);
  });
  
  test('debería lanzar error con número de ticket inválido', () => {
    const ticketData = {
      id: '123456',
      ci: '12345678',
      plate: 'ABC-123',
      ticketNumber: 0, // Debe ser mayor a 0
      stationId: '987654',
      stationName: 'Estación Central',
      createdAt: new Date()
    };
    
    expect(() => new Ticket(ticketData)).toThrow(/número de ticket/);
  });
  
  test('debería convertir ticketNumber de string a número', () => {
    const ticketData = {
      id: '123456',
      ci: '12345678',
      plate: 'ABC-123',
      ticketNumber: '42', // Como string
      stationId: '987654',
      stationName: 'Estación Central',
      createdAt: new Date()
    };
    
    const ticket = new Ticket(ticketData);
    
    expect(typeof ticket.ticketNumber).toBe('number');
    expect(ticket.ticketNumber).toBe(42);
  });
});

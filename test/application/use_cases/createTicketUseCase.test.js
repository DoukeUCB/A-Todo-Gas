const { createTicket } = require('../../../src/application/use_cases/createTicketUseCase');
const Ticket = require('../../../src/domain/entities/Ticket');

describe('createTicketUseCase', () => {
  it('debería crear un ticket válido', () => {
    const data = {
      id: '1',
      ci: '1234567',
      plate: 'ABC-123',
      ticketNumber: 10,
      stationId: 'ST01',
      stationName: 'Estación Central',
      createdAt: new Date()
    };
    const ticket = createTicket(data);
    expect(ticket).toBeInstanceOf(Ticket);
    expect(ticket.ci).toBe(data.ci);
    expect(ticket.plate).toBe(data.plate);
    expect(ticket.ticketNumber).toBe(data.ticketNumber);
    expect(ticket.stationId).toBe(data.stationId);
    expect(ticket.stationName).toBe(data.stationName);
    expect(ticket.createdAt).toBeInstanceOf(Date);
  });

  it('debería lanzar un error si el CI es inválido', () => {
    const data = {
      id: '2',
      ci: 'ABC123', // CI inválido
      plate: 'XYZ-789',
      ticketNumber: 11,
      stationId: 'ST02',
      stationName: 'Estación Norte',
      createdAt: new Date()
    };
    expect(() => createTicket(data)).toThrow('El CI es requerido y debe contener solo números');
  });

  it('debería lanzar un error si la matrícula es inválida', () => {
    const data = {
      id: '3',
      ci: '9876543',
      plate: 'abc-123', // minúsculas no permitidas
      ticketNumber: 12,
      stationId: 'ST03',
      stationName: 'Estación Sur',
      createdAt: new Date()
    };
    expect(() => createTicket(data)).toThrow('La matrícula es requerida y debe tener formato válido (letras mayúsculas, números y guiones)');
  });

  it('debería lanzar un error si el nombre de la estación está vacío', () => {
    const data = {
      id: '4',
      ci: '5555555',
      plate: 'DEF-456',
      ticketNumber: 13,
      stationId: 'ST04',
      stationName: '', // nombre vacío
      createdAt: new Date()
    };
    expect(() => createTicket(data)).toThrow('El nombre de la estación es requerido');
  });
});

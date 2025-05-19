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
});

const Ticket = require('../../domain/entities/Ticket');

function createTicket(data) {
  // Simula la creación y retorno del ticket (sin persistencia)
  return new Ticket(data);
}

module.exports = { createTicket };
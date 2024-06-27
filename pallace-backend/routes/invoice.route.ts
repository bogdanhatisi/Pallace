import { FastifyInstance } from 'fastify';
import {
  getUserInvoices,
  saveInvoice,
  updateInvoice
} from '../controllers/invoice.controller';

export async function invoiceRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    return reply
      .code(200)
      .send(
        'Hello, this is the invoice route. Perhaps you are looking for numbers, fellow capitalist?!'
      );
  });
  app.post('/upload/:type', { preHandler: [app.authenticate] }, saveInvoice);
  app.get(
    '/allUserInvoices/:type',
    { preHandler: [app.authenticate] },
    getUserInvoices
  );
  app.log.info('invoice routes registered');
  app.put('/updateInvoice', { preHandler: [app.authenticate] }, updateInvoice);
}

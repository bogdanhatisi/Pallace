import { FastifyInstance } from 'fastify';
import { verifyOwnership } from '../controllers/storage.controller';

export async function storageRoutes(app: FastifyInstance) {
  app.get(
    '/api/storage/:userId/*',
    { preHandler: [app.authenticate] },
    verifyOwnership
  );
  app.get(
    '/api/storage/:userId/*',
    { preHandler: [app.authenticate, verifyOwnership] },
    verifyOwnership
  );
  app.log.info('storage routes registered');
}

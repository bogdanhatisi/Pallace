import { FastifyInstance } from 'fastify';
import { deleteFile, getFile } from '../controllers/storage.controller';

export async function storageRoutes(app: FastifyInstance) {
  app.get('/:userId/*', { preHandler: [app.authenticate] }, getFile);
  app.delete(
    '/:userId/:filename',
    { preHandler: [app.authenticate] },
    deleteFile
  );
  app.log.info('storage routes registered');
}

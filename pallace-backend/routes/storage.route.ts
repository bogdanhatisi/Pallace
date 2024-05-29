import { FastifyInstance } from 'fastify';
import {
  deleteFile,
  getFile,
  processFile
} from '../controllers/storage.controller';

export async function storageRoutes(app: FastifyInstance) {
  app.get('/:userId/*', { preHandler: [app.authenticate] }, getFile);
  app.delete(
    '/:userId/:filename',
    { preHandler: [app.authenticate] },
    deleteFile
  );
  app.get(
    '/:userId/:filename/process',
    { preHandler: [app.authenticate] },
    processFile
  );
  app.log.info('storage routes registered');
}

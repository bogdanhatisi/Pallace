import { FastifyInstance } from 'fastify';
import {
  deleteFile,
  getFileMime,
  processFileOCR,
  processFilePDF
} from '../controllers/storage.controller';

export async function storageRoutes(app: FastifyInstance) {
  app.get('/:userId/*', { preHandler: [app.authenticate] }, getFileMime);
  app.delete(
    '/:userId/:filename',
    { preHandler: [app.authenticate] },
    deleteFile
  );
  app.get(
    '/:userId/:filename/process',
    { preHandler: [app.authenticate] },
    processFilePDF
  );
  app.get(
    '/:userId/:filename/processOCR',
    { preHandler: [app.authenticate] },
    processFileOCR
  );
  app.log.info('storage routes registered');
}

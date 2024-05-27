import { FastifyInstance } from 'fastify';
import { getHomeUserData } from '../controllers/dashboard.controller';

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    return reply.code(200).send('Hello, logged user!');
  });
  app.get('/homeUserData', { preHandler: [app.authenticate] }, getHomeUserData);
  app.log.info('dashboard routes registered');
}

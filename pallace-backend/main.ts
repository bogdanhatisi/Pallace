import Fastify from 'fastify';
import userRoutes from './routes/user.route';
import { userSchemas } from './models/user.model';

export const server = Fastify();

server.get('/healthcheck', async function () {
  return { status: 'OK' };
});

async function main() {
  for (const schema of userSchemas) {
    server.addSchema(schema);
  }
  server.register(userRoutes, { prefix: '/api/users' });

  try {
    await server.listen({
      port: 3000
    });
    console.log('Server is running on port 3000');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
main();

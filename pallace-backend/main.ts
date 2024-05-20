import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import { userRoutes } from './routes/user.route';
import { userSchemas } from './models/user.model';
import fjwt, { FastifyJWT } from '@fastify/jwt';
import fCookie from '@fastify/cookie';
import { JWT } from '@fastify/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT;
  }
  export interface FastifyInstance {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authenticate: any;
  }
}
type UserPayload = {
  id: string;
  email: string;
  name: string;
};
declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: UserPayload;
  }
}

const app = Fastify({ logger: true }); // you can disable logging

// graceful shutdown
const listeners = ['SIGINT', 'SIGTERM'];
listeners.forEach(signal => {
  process.on(signal, async () => {
    await app.close();
    process.exit(0);
  });
});

async function main() {
  app.get('/healthcheck', (req, res) => {
    res.send({ message: 'Success' });
  });
  // jwt
  app.register(fjwt, { secret: 'supersecretcode-CHANGE_THIS-USE_ENV_FILE' });
  app.decorate(
    'authenticate',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const token = req.cookies.access_token;
      if (!token) {
        return reply.status(401).send({ message: 'Authentication required' });
      }
      // here decoded will be a different type by default but we want it to be of user-payload type
      const decoded = req.jwt.verify<FastifyJWT['user']>(token);
      req.user = decoded;
    }
  );
  app.addHook('preHandler', (req, res, next) => {
    // here we are
    req.jwt = app.jwt;
    return next();
  });
  // cookies
  app.register(fCookie, {
    secret: 'some-secret-key',
    hook: 'preHandler'
  });
  // routes
  app.register(userRoutes, { prefix: 'api/users' });
  for (const schema of [...userSchemas]) {
    app.addSchema(schema);
  }
  await app.listen({
    port: 8000,
    host: '0.0.0.0'
  });
}

main();

import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import { userRoutes } from './routes/user.route';
import { userSchemas } from './models/user.model';
import { dashboardRoutes } from './routes/dashboard.route';
import { JWT } from '@fastify/jwt';
import { invoiceRoutes } from './routes/invoice.route';
import fjwt from '@fastify/jwt';
import fCookie from '@fastify/cookie';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { storageRoutes } from './routes/storage.route';

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

app.register(cors, {
  origin: 'http://localhost:3000', // Adjust this to specify allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
  credentials: true
});

// register multipart to handle files
app.register(multipart);

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
      console.log(token);
      if (!token) {
        return reply.status(401).send({ message: 'Authentication required' });
      }
      try {
        const decoded = req.jwt.verify<UserPayload>(token);
        console.log(decoded);
        req.user = decoded;
      } catch (err) {
        req.log.error(err);
        return reply.status(401).send({ message: 'Invalid token' });
      }
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
  app.register(userRoutes, {
    prefix: 'api/users'
  });

  for (const schema of [...userSchemas]) {
    app.addSchema(schema);
  }

  app.register(dashboardRoutes, {
    prefix: 'api/dashboard'
  });

  app.register(invoiceRoutes, { prefix: 'api/invoices' });
  app.register(storageRoutes, { prefix: 'api/storage' });
  await app.listen({
    port: 8000,
    host: '0.0.0.0'
  });
}

main();

import { FastifyInstance } from 'fastify';
import { registerUserHandler } from '../controllers/user.controller';
import { $ref } from '../models/user.model';

async function userRoutes(server: FastifyInstance) {
  server.post(
    '/createUser',
    {
      schema: {
        body: $ref('createUserSchema'),
        response: {
          201: $ref('createUserResponseSchema')
        }
      }
    },
    registerUserHandler
  );
}

export default userRoutes;

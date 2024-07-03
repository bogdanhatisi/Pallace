import { FastifyInstance } from 'fastify';
import { $ref } from '../models/user.model';
import {
  createUser,
  getUsers,
  login,
  logout,
  updateUser
} from '../controllers/user.controller';

export async function userRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [app.authenticate]
    },
    getUsers
  );
  app.post(
    '/register',
    {
      schema: {
        body: $ref('createUserSchema'),
        response: {
          201: $ref('createUserResponseSchema')
        }
      }
    },
    createUser
  );
  app.post(
    '/login',
    {
      schema: {
        body: $ref('loginSchema'),
        response: {
          201: $ref('loginResponseSchema')
        }
      }
    },
    login
  );
  app.put(
    '/update',
    {
      schema: {
        body: $ref('updateUserSchema'),
        response: {
          200: $ref('updateUserResponseSchema')
        }
      },
      preHandler: [app.authenticate]
    },
    updateUser
  );
  app.delete('/logout', { preHandler: [app.authenticate] }, logout);
  app.log.info('user routes registered');
}

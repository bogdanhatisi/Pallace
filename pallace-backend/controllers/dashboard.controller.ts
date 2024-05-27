import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../utils/prisma';

export async function getHomeUserData(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const userId = req.user;
  console.log(req.user);
  try {
    const userFound = await prisma.user.findUnique({
      where: {
        id: userId.id
      }
    });
    let userName = 'UNDEFINED';
    if (userFound && userFound.name) {
      userName = userFound.name;
    }

    const data = { name: userName };
    return reply.code(200).send(data);
  } catch (e) {
    return reply.code(500).send(req.user);
  }
}

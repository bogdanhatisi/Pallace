import { FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import {
  CreateUserInput,
  LoginUserInput,
  UpdateUserInput
} from '../models/user.model';
import fs from 'fs';
import util from 'util';
const SALT_ROUNDS = 10;
const writeFile = util.promisify(fs.writeFile);
import path from 'path';

export async function createUser(
  req: FastifyRequest<{
    Body: CreateUserInput;
  }>,
  reply: FastifyReply
) {
  const { password, email, name } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  });
  if (user) {
    return reply.code(401).send({
      message: 'User already exists with this email'
    });
  }
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        password: hash,
        email,
        name
      }
    });
    return reply.code(201).send(user);
  } catch (e) {
    return reply.code(500).send(e);
  }
}

export async function login(
  req: FastifyRequest<{
    Body: LoginUserInput;
  }>,
  reply: FastifyReply
) {
  const { email, password } = req.body; /*
  MAKE SURE TO VALIDATE (according to you needs) user data
  before performing the db query
 */
  const user = await prisma.user.findUnique({ where: { email: email } });
  const isMatch = user && (await bcrypt.compare(password, user.password));
  if (!user || !isMatch) {
    return reply.code(401).send({
      message: 'Invalid email or password'
    });
  }
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name
  };
  const token = req.jwt.sign(payload);
  reply.setCookie('access_token', token, {
    path: '/',
    httpOnly: true,
    secure: true
  });
  return { accessToken: token };
}

export async function getUsers(req: FastifyRequest, reply: FastifyReply) {
  const users = await prisma.user.findMany({
    select: {
      name: true,
      id: true,
      email: true
    }
  });
  return reply.code(200).send(users);
}

export async function logout(req: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie('access_token');
  return reply.send({ message: 'Logout successful' });
}

export async function updateUser(
  req: FastifyRequest<{
    Body: UpdateUserInput;
  }>,
  reply: FastifyReply
) {
  const { name, password } = req.body;
  const userId = req.user.id; // Assuming you have a middleware that adds the user ID to the request object

  try {
    let hash;
    if (password) {
      hash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        name,
        ...(password && { password: hash }) // Only update the password if it's provided
      }
    });

    return reply.code(200).send(updatedUser);
  } catch (e) {
    return reply.code(500).send(e);
  }
}

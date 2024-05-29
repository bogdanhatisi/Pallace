import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

//TODO Refactor this file

export async function verifyOwnership(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<string | null> {
  const url = req.raw.url;
  if (url) {
    const urlSegments = url.split('/');
    const userIdFromUrl = urlSegments ? urlSegments[3] : null; // Extract userId from URL
    if (!userIdFromUrl) {
      reply.status(404).send({
        message: 'Invalid URL'
      });
      return null;
    }
    if (!req.user) {
      reply.status(401).send({
        message: 'Unauthorized, please log in first'
      });
      return null;
    }
    const userId = req.user.id;
    if (userIdFromUrl.toString() !== userId.toString()) {
      reply.status(403).send({
        message:
          'Access forbidden: You do not have permission to access this file'
      });
      return null;
    }

    let filePath = urlSegments ? urlSegments[4] : null;

    if (!filePath) {
      reply.status(404).send({
        message: 'Invalid URL'
      });
      return null;
    }
    filePath = `uploads\\${userId}\\` + filePath;
    // Check if the file belongs to the user
    const invoice = await prisma.invoice.findFirst({
      where: {
        userId: userId,
        filePath: filePath
      }
    });

    if (!invoice) {
      reply.status(403).send({
        message:
          'Access forbidden: You do not have permission to access this file'
      });
      return null;
    }

    return filePath;
  }
  return null;
}

export async function getFile(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const filePath = await verifyOwnership(req, reply);

  if (filePath != null) {
    const fileContents = await fs.promises.readFile(filePath);
    reply.type('application/pdf').send(fileContents);
  } else {
    reply.status(404).send({
      message: 'Invalid URL'
    });
    return;
  }
}

export async function deleteFile(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  console.log('DELETE FILE');
  const ownership = await verifyOwnership(req, reply);
  if (ownership != null) {
    const { userId, filename } = req.params as {
      userId: string;
      filename: string;
    };
    const filePath = path.join(__dirname, '../uploads', userId, filename);
    const prismaFilePath = `uploads\\${userId}\\${filename}`;
    console.log('FILE PATH', filePath);

    try {
      // Remove the file record from the database
      console.log(
        'PRISMA LOG',
        await prisma.invoice.deleteMany({
          where: {
            userId: userId,
            filePath: prismaFilePath
          }
        })
      );

      await fs.promises.unlink(filePath);

      reply.send({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      reply.status(500).send({ message: 'Error deleting file' });
    }
  } else {
    reply.status(404).send({
      message: 'Invalid URL'
    });
    return;
  }
}

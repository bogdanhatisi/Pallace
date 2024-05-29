import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function verifyOwnership(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const url = req.raw.url;
  if (url) {
    const urlSegments = url.split('/');
    const userIdFromUrl = urlSegments ? urlSegments[3] : null; // Extract userId from URL
    if (!userIdFromUrl) {
      reply.status(404).send({
        message: 'Invalid URL'
      });
      return;
    }
    console.log('USER', req.user);
    if (!req.user) {
      reply.status(401).send({
        message: 'Unauthorized, please log in first'
      });
      return;
    }
    const userId = req.user.id;
    console.log(userIdFromUrl, userId);
    if (userIdFromUrl.toString() !== userId.toString()) {
      reply.status(403).send({
        message:
          'Access forbidden: You do not have permission to access this file'
      });
      return;
    }

    let filePath = urlSegments ? urlSegments[4] : null;

    console.log('FILEPATH', filePath);
    if (!filePath) {
      reply.status(404).send({
        message: 'Invalid URL'
      });
      return;
    }
    filePath = `uploads\\${userId}\\` + filePath;
    console.log('FILEPATH COMPLETE', filePath);
    // Check if the file belongs to the user
    const invoice = await prisma.invoice.findFirst({
      where: {
        userId: userId,
        filePath: filePath
      }
    });

    console.log(invoice);

    if (!invoice) {
      reply.status(403).send({
        message:
          'Access forbidden: You do not have permission to access this file'
      });
      return;
    }
    const fileContents = await fs.promises.readFile(filePath);
    reply.type('application/pdf').send(fileContents);
  } else {
    reply.status(404).send({
      message: 'Invalid URL'
    });
    return;
  }
}

export async function verifyOwnershipAndDeleteFile(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const { userId, filename } = req.params as {
    userId: string;
    filename: string;
  };
  const filePath = path.join(__dirname, '../uploads', userId, filename);

  try {
    await fs.promises.unlink(filePath);

    // Remove the file record from the database
    await prisma.invoice.deleteMany({
      where: {
        userId: userId,
        filePath: filePath
      }
    });

    reply.send({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    reply.status(500).send({ message: 'Error deleting file' });
  }
}

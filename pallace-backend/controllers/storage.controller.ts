import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

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

export async function processFile(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<string | null> {
  const ownership = await verifyOwnership(req, reply);
  if (ownership == null) {
    reply.status(404).send({
      message: 'Invalid URL'
    });
  }
  const { userId, filename } = req.params as {
    userId: string;
    filename: string;
  };
  const filePath = path.join(__dirname, '../uploads', userId, filename);
  const prismaFilePath = `uploads\\${userId}\\${filename}`;
  const fileContents = await fs.promises.readFile(filePath);
  const data = await pdf(fileContents);

  console.log('DATA', data);

  // Extract text content
  const text = data.text;

  console.log('TEXT', text);

  // Split the text into lines and search for the "TOTAL" label
  const lines = text.split('\n');
  const totals: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Total')) {
      // Assuming the number is in the same line after the "TOTAL" label
      const match = lines[i].match(/Total\$([0-9,]+\.\d{2})/);
      if (match && match[1]) {
        console.log('TOTAL', match[1]);
        if (match && match[1]) {
          totals.push(match[1]);
        }
      }
    }
  }
  if (totals.length > 0) {
    const lastTotal = totals[totals.length - 1];
    console.log('LAST TOTAL', lastTotal);
    console.log('TOTAL', parseFloat(lastTotal.replace(/,/g, '')));
    console.log('USER ID', userId);
    console.log('PRISMA FILE PATH', prismaFilePath);

    // Update the total in the database
    const updatedInvoice = await prisma.invoice.updateMany({
      where: {
        userId: userId,
        filePath: prismaFilePath
      },
      data: {
        total: parseFloat(lastTotal.replace(/,/g, ''))
      }
    });
    console.log('TOTAL', updatedInvoice);
    reply.status(200).send({
      message: 'File processed successfully'
    });
    return lastTotal;
  }

  reply.status(404).send({
    message: 'Processing failed: Total not found in the file'
  });
  return null;
}

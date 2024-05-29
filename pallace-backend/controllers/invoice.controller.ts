import { pipeline } from 'stream';
import util from 'util';
import fs from 'fs';
import path from 'path';
import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';

const pump = util.promisify(pipeline);
const prisma = new PrismaClient();

const uploadDir = './uploads';

async function createDirectoryIfNotExists(directory: string): Promise<void> {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// async function moveFile(source: string, destination: string): Promise<void> {
//   await fs.promises.rename(source, destination);
// }

async function cleanUpFiles(directory: string): Promise<void> {
  const files = await fs.promises.readdir(directory);
  const unlinkPromises = files.map(file =>
    fs.promises.unlink(path.join(directory, file))
  );
  await Promise.all(unlinkPromises);
}

export async function saveInvoice(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> {
  // Ensure userId is available in the request
  const userId = req.user?.id;

  if (!userId) {
    return reply.code(400).send({ error: 'User ID is required' });
  }

  const userUploadDir = path.join(uploadDir, userId);

  // Ensure the user-specific directory exists
  await createDirectoryIfNotExists(userUploadDir);

  try {
    const parts = req.files();

    for await (const part of parts) {
      if (part.file) {
        const filePath = path.join(userUploadDir, part.filename);
        await pump(part.file, fs.createWriteStream(filePath));

        // Save invoice details to the database
        await prisma.invoice.create({
          data: {
            filePath,
            total: 0, // You can replace this with actual total if available in the request
            userId
          }
        });
      }
    }

    return reply.code(200).send({ message: 'Files uploaded successfully' });
  } catch (e) {
    await cleanUpFiles(userUploadDir);
    return reply.code(500).send({ error: (e as Error).message });
  }
}

export async function getUserInvoices(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> {
  const userId = req.user?.id;

  if (!userId) {
    return reply.code(400).send({ error: 'User ID is required' });
  }

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return reply.code(200).send(invoices);
  } catch (e) {
    return reply.code(500).send({ error: (e as Error).message });
  }
}

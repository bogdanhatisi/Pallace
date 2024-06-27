import { pipeline } from 'stream';
import util from 'util';
import fs from 'fs';
import path from 'path';
import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import {
  InvoiceType,
  UpdateInvoiceBodyType,
  UploadInvoiceBodyType
} from '../models/invoice.model';

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

export async function updateInvoice(
  req: FastifyRequest<{ Body: UpdateInvoiceBodyType }>,
  reply: FastifyReply
): Promise<FastifyReply> {
  const userId = req.user?.id;
  const { id, total, category, createdAt, type } = req.body;

  console.log(createdAt);

  if (!userId) {
    return reply.code(400).send({ error: 'User ID is required' });
  }

  try {
    // Validate request body
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id }
    });

    if (!existingInvoice || existingInvoice.userId !== userId) {
      return reply
        .code(404)
        .send({ error: 'Invoice not found or access denied' });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        total,
        createdAt,
        category,
        type
      }
    });

    return reply.code(200).send(updatedInvoice);
  } catch (e) {
    return reply.code(500).send({ error: (e as Error).message });
  }
}

export async function saveInvoice(
  req: FastifyRequest<{ Body: UploadInvoiceBodyType }>,
  reply: FastifyReply
): Promise<FastifyReply> {
  // Ensure userId is available in the request

  console.log(req);
  const userId = req.user?.id;
  const { type } = req.params as { type: InvoiceType };

  if (!userId) {
    return reply.code(400).send({ error: 'User ID is required' });
  }

  if (!type) {
    return reply.code(400).send({ error: 'Invoice type is required' });
  }

  const userUploadDir = path.join(uploadDir, userId);

  // Ensure the user-specific directory exists
  await createDirectoryIfNotExists(userUploadDir);

  try {
    const parts = req.files();

    for await (const part of parts) {
      if (part.file) {
        const filePath = path.join(
          userUploadDir,
          decodeURIComponent(part.filename)
        );

        // Check if a file with the same name already exists
        if (fs.existsSync(filePath)) {
          return reply
            .code(400)
            .send({ error: 'File with the same name already exists' });
        }

        await pump(part.file, fs.createWriteStream(filePath));

        // Save invoice details to the database
        await prisma.invoice.create({
          data: {
            filePath,
            total: 0, // You can replace this with actual total if available in the request
            userId,
            type
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
  const { type } = req.params as { type: InvoiceType };

  if (!userId) {
    return reply.code(400).send({ error: 'User ID is required' });
  }

  if (!type) {
    return reply.code(400).send({ error: 'Invoice type is required' });
  }

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: userId,
        type: type
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

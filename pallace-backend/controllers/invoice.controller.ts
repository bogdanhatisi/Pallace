import { pipeline } from 'stream';
import util from 'util';
import fs from 'fs';
import path from 'path';
import { FastifyReply, FastifyRequest } from 'fastify';

const pump = util.promisify(pipeline);
const tempDir = './temp-uploads';
const uploadDir = './uploads';

async function moveFile(source: string, destination: string): Promise<void> {
  await fs.promises.rename(source, destination);
}

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
  // Ensure the temporary directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  try {
    const parts = req.files();

    // Save files to the temporary directory
    for await (const part of parts) {
      if (part.file) {
        const tempFilePath = path.join(tempDir, part.filename);
        await pump(part.file, fs.createWriteStream(tempFilePath));
      }
    }

    // If all files are saved successfully, move them to the final upload directory
    const files = await fs.promises.readdir(tempDir);
    await Promise.all(
      files.map(file =>
        moveFile(path.join(tempDir, file), path.join(uploadDir, file))
      )
    );

    return reply.code(200).send({ message: 'files uploaded' });
  } catch (e) {
    // If there is an error, clean up any files saved in the temporary directory
    await cleanUpFiles(tempDir);
    return reply.code(500).send({ error: (e as Error).message });
  } finally {
    // Clean up the temporary directory after processing
    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir, { recursive: true });
    }
  }
}

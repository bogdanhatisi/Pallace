import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = 3000;
const prisma = new PrismaClient();

// Import any additional modules or types you need

// Define the type for the request and response objects
type Request = express.Request;
type Response = express.Response;

// Add your routes and route handlers
app.get('/', async (req: Request, res: Response) => {
  await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io'
    }
  });
  const allUsers = await prisma.user.findMany();
  res.send(allUsers);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

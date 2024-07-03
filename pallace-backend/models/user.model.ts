import { z } from 'zod';
import { buildJsonSchemas } from 'fastify-zod';

const getUserSchema = z.object({ token: z.string() });

export type GetUserInput = z.infer<typeof getUserSchema>;

// data that we need from user to register
const createUserSchema = z.object({
  email: z.string(),
  password: z.string().min(6),
  name: z.string()
});
//exporting the type to provide to the request Body
export type CreateUserInput = z.infer<typeof createUserSchema>;
// response schema for registering user
const createUserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string()
});
// same for login route
const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string'
    })
    .email(),
  password: z.string().min(6)
});
export type LoginUserInput = z.infer<typeof loginSchema>;
const loginResponseSchema = z.object({
  accessToken: z.string()
});

// Schema for updating a user
const updateUserSchema = z.object({
  name: z.string(),
  password: z.string().optional()
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Response schema for updating a user
const updateUserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string()
});

// Building JSON schemas
export const { schemas: userSchemas, $ref } = buildJsonSchemas({
  getUserSchema,
  createUserSchema,
  createUserResponseSchema,
  loginSchema,
  loginResponseSchema,
  updateUserSchema,
  updateUserResponseSchema
});

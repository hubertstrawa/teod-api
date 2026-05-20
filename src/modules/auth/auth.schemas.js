import { z } from 'zod'

const signupBodySchema = z
  .object({
    email: z.string().trim().email(),
    playerName: z.string().trim().min(3).max(30),
    password: z.string().min(6).max(128),
    race: z.enum(['human', 'elf', 'orc']).optional(),
    avatar: z.string().trim().min(1).max(255).optional(),
  })
  .strict()

const loginBodySchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(1).max(128),
  })
  .strict()

const emptyBodySchema = z.object({}).strict()
const emptyQuerySchema = z.object({}).strict()
const emptyParamsSchema = z.object({}).strict()

const authSchemas = {
  signup: {
    body: signupBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  login: {
    body: loginBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  refresh: {
    body: emptyBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  logout: {
    body: emptyBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
}

export default authSchemas

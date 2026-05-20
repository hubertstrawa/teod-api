import { z } from 'zod'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Nieprawidlowy identyfikator')
const emptyBodySchema = z.object({}).strict()
const emptyQuerySchema = z.object({}).strict()
const emptyParamsSchema = z.object({}).strict()

const taskIdBodySchema = z
  .object({
    taskId: objectIdSchema,
  })
  .strict()

const tasklogSchemas = {
  getTasks: {
    body: emptyBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  getPlayerTasklog: {
    body: emptyBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  startTask: {
    body: taskIdBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  finishTask: {
    body: taskIdBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  closeTask: {
    body: emptyBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
}

export default tasklogSchemas

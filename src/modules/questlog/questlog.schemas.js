import { z } from 'zod'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Nieprawidlowy identyfikator')
const emptyBodySchema = z.object({}).strict()
const emptyQuerySchema = z.object({}).strict()
const emptyParamsSchema = z.object({}).strict()

const questIdBodySchema = z
  .object({
    questId: objectIdSchema,
  })
  .strict()

const questlogSchemas = {
  getPlayerQuestlog: {
    body: emptyBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  startQuest: {
    body: questIdBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  finishQuest: {
    body: questIdBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
}

export default questlogSchemas

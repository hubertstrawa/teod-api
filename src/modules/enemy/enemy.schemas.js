import { z } from 'zod'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Nieprawidlowy identyfikator')
const emptyBodySchema = z.object({}).strict()
const emptyParamsSchema = z.object({}).strict()

const getEnemiesQuerySchema = z
  .object({
    location: z.string().trim().min(1),
  })
  .strict()

const getSingleEnemyQuerySchema = z
  .object({
    enemyId: objectIdSchema,
  })
  .strict()

const enemySchemas = {
  getEnemies: {
    body: emptyBodySchema,
    query: getEnemiesQuerySchema,
    params: emptyParamsSchema,
  },
  getSingleEnemy: {
    body: emptyBodySchema,
    query: getSingleEnemyQuerySchema,
    params: emptyParamsSchema,
  },
}

export default enemySchemas

import { z } from 'zod'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Nieprawidlowy identyfikator')
const emptyBodySchema = z.object({}).strict()
const emptyQuerySchema = z.object({}).strict()
const emptyParamsSchema = z.object({}).strict()

const startBattleBodySchema = z
  .object({
    enemyId: objectIdSchema,
  })
  .strict()

const spellPayloadSchema = z
  .object({
    spellType: z.enum(['normal', 'fire', 'electric']),
    name: z.string().trim().min(1).optional(),
  })
  .passthrough()
  .superRefine((value, ctx) => {
    if (value.spellType !== 'normal' && !value.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['name'],
        message: 'Nazwa czaru jest wymagana dla ataku magicznego',
      })
    }
  })

const attackEnemyBodySchema = z
  .object({
    spell: spellPayloadSchema,
  })
  .strict()

const battlelogSchemas = {
  getBattlelog: {
    body: emptyBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  getFullBattlelog: {
    body: emptyBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  startBattle: {
    body: startBattleBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  attackEnemy: {
    body: attackEnemyBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  getEnemyPlayerData: {
    body: emptyBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
}

export default battlelogSchemas

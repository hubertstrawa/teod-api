import { z } from 'zod'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Nieprawidlowy identyfikator')
const playerNameSchema = z.string().trim().min(3).max(30)

const emptyBodySchema = z.object({}).strict()
const emptyQuerySchema = z.object({}).strict()
const emptyParamsSchema = z.object({}).strict()

const updateMeBodySchema = z
  .object({
    tutorial: z.number().int().min(0).max(1).optional(),
    avatar: z.string().trim().min(1).max(255).optional(),
    playerName: playerNameSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Body nie moze byc pusty',
  })

const addAttributeBodySchema = z
  .object({
    attributeName: z.enum([
      'strength',
      'intelligence',
      'vitality',
      'accuracy',
      'agility',
    ]),
  })
  .strict()

const startJobBodySchema = z
  .object({
    locationName: z.enum(['forgotten-forest']),
  })
  .strict()

const notificationBodySchema = z
  .object({
    notificationId: objectIdSchema,
  })
  .strict()

const inviteToFriendsBodySchema = z
  .object({
    playerName: playerNameSchema,
  })
  .strict()

const acceptInvitationBodySchema = z
  .object({
    senderId: objectIdSchema,
  })
  .strict()

const getSinglePlayerQuerySchema = z
  .object({
    playerName: playerNameSchema,
  })
  .strict()

const playerSchemas = {
  getMe: { body: emptyBodySchema, query: emptyQuerySchema, params: emptyParamsSchema },
  getPlayersHighscores: {
    body: emptyBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  updateMe: { body: updateMeBodySchema, query: emptyQuerySchema, params: emptyParamsSchema },
  addAttribute: {
    body: addAttributeBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  startJob: { body: startJobBodySchema, query: emptyQuerySchema, params: emptyParamsSchema },
  finishJob: { body: emptyBodySchema, query: emptyQuerySchema, params: emptyParamsSchema },
  closeJob: { body: emptyBodySchema, query: emptyQuerySchema, params: emptyParamsSchema },
  setNotificationRead: {
    body: notificationBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  inviteToFriends: {
    body: inviteToFriendsBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  acceptFriendsInvitation: {
    body: acceptInvitationBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  getSinglePlayer: {
    body: emptyBodySchema,
    query: getSinglePlayerQuerySchema,
    params: emptyParamsSchema,
  },
}

export default playerSchemas

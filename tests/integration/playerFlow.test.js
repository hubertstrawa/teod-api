import test from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import request from 'supertest'
import validate from '../../src/shared/http/validate.js'
import errorHandler from '../../src/shared/http/errorHandler.js'
import playerSchemas from '../../src/modules/player/player.schemas.js'
import { createPlayerController } from '../../src/modules/player/player.controller.js'

const createPlayerTestApp = (serviceDouble) => {
  const app = express()
  const router = express.Router()
  const controller = createPlayerController(serviceDouble)

  app.use(express.json())
  app.use((req, _res, next) => {
    req.email = 'tester@example.com'
    next()
  })

  router.route('/updateMe').patch(validate(playerSchemas.updateMe), controller.updateMe)
  router
    .route('/inviteToFriends')
    .post(validate(playerSchemas.inviteToFriends), controller.inviteToFriends)
  router
    .route('/acceptFriendsInvitation')
    .post(
      validate(playerSchemas.acceptFriendsInvitation),
      controller.acceptFriendsInvitation
    )

  app.use('/api/v1/player', router)
  app.use(errorHandler)

  return app
}

test('player flow keeps endpoint contracts for updateMe/invite/accept', async () => {
  const calls = []
  const serviceDouble = {
    updateMe: async ({ email, payload }) => {
      calls.push({ type: 'updateMe', email, payload })
      return { data: 'User updated' }
    },
    inviteToFriends: async ({ email, playerName }) => {
      calls.push({ type: 'inviteToFriends', email, playerName })
      return { message: `Wysłano zaproszenie do gracza ${playerName}` }
    },
    acceptFriendsInvitation: async ({ email, senderId }) => {
      calls.push({ type: 'acceptFriendsInvitation', email, senderId })
      return { message: 'Gracz dodany do znajomych' }
    },
  }

  const app = createPlayerTestApp(serviceDouble)

  const updateResponse = await request(app).patch('/api/v1/player/updateMe').send({
    avatar: '/avatars/new.png',
  })
  assert.equal(updateResponse.status, 200)
  assert.equal(updateResponse.body.data, 'User updated')

  const inviteResponse = await request(app).post('/api/v1/player/inviteToFriends').send({
    playerName: 'OtherPlayer',
  })
  assert.equal(inviteResponse.status, 200)
  assert.equal(
    inviteResponse.body.message,
    'Wysłano zaproszenie do gracza OtherPlayer'
  )

  const senderId = '507f1f77bcf86cd799439011'
  const acceptResponse = await request(app)
    .post('/api/v1/player/acceptFriendsInvitation')
    .send({
      senderId,
    })
  assert.equal(acceptResponse.status, 200)
  assert.equal(acceptResponse.body.message, 'Gracz dodany do znajomych')

  assert.deepEqual(calls, [
    {
      type: 'updateMe',
      email: 'tester@example.com',
      payload: { avatar: '/avatars/new.png' },
    },
    {
      type: 'inviteToFriends',
      email: 'tester@example.com',
      playerName: 'OtherPlayer',
    },
    {
      type: 'acceptFriendsInvitation',
      email: 'tester@example.com',
      senderId,
    },
  ])
})

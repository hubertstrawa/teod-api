import test from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import createApp from '../../app/createApp.js'

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-secret'

const createAuthHeader = () => {
  const token = jwt.sign(
    {
      UserInfo: {
        email: 'tester@example.com',
        id: '507f1f77bcf86cd799439011',
        playerName: 'Tester',
      },
    },
    process.env.ACCESS_TOKEN_SECRET
  )

  return `Bearer ${token}`
}

const assertValidationError = (response) => {
  assert.equal(response.status, 400)
  assert.equal(response.body?.error?.code, 'VALIDATION_ERROR')
  assert.equal(response.body?.error?.message, 'Nieprawidlowe dane wejsciowe')
  assert.ok(Array.isArray(response.body?.error?.details))
  assert.ok(response.body.error.details.length > 0)
}

test('POST /api/v1/auth/signup rejects missing required fields', async () => {
  const app = createApp()
  const response = await request(app).post('/api/v1/auth/signup').send({
    playerName: 'new-player',
    password: '12345678',
  })

  assertValidationError(response)
})

test('POST /api/v1/auth/login rejects invalid email format', async () => {
  const app = createApp()
  const response = await request(app).post('/api/v1/auth/login').send({
    email: 'not-an-email',
    password: '123456',
  })

  assertValidationError(response)
})

test('POST /api/v1/player/addAttribute rejects unsupported attribute', async () => {
  const app = createApp()
  const response = await request(app)
    .post('/api/v1/player/addAttribute')
    .set('Authorization', createAuthHeader())
    .send({
      attributeName: 'luck',
    })

  assertValidationError(response)
})

test('POST /api/v1/player/setNotificationRead rejects invalid object id', async () => {
  const app = createApp()
  const response = await request(app)
    .post('/api/v1/player/setNotificationRead')
    .set('Authorization', createAuthHeader())
    .send({
      notificationId: '123',
    })

  assertValidationError(response)
})

test('GET /api/v1/player/getSinglePlayer rejects missing query param', async () => {
  const app = createApp()
  const response = await request(app)
    .get('/api/v1/player/getSinglePlayer')
    .set('Authorization', createAuthHeader())

  assertValidationError(response)
})

test('POST /api/v1/player/startJob rejects unsupported location', async () => {
  const app = createApp()
  const response = await request(app)
    .post('/api/v1/player/startJob')
    .set('Authorization', createAuthHeader())
    .send({
      locationName: 'unknown-location',
    })

  assertValidationError(response)
})

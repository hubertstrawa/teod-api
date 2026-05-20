import test from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import validate from '../../src/shared/http/validate.js'
import errorHandler from '../../src/shared/http/errorHandler.js'
import authSchemas from '../../src/modules/auth/auth.schemas.js'
import { createAuthController } from '../../src/modules/auth/auth.controller.js'

const createAuthTestApp = (serviceDouble) => {
  const app = express()
  const router = express.Router()
  const controller = createAuthController(serviceDouble)

  app.use(cookieParser())
  app.use(express.json())

  router.route('/signup').post(validate(authSchemas.signup), controller.signup)
  router.route('/login').post(validate(authSchemas.login), controller.login)
  router.route('/refresh').get(validate(authSchemas.refresh), controller.refresh)
  router.route('/logout').post(validate(authSchemas.logout), controller.logout)

  app.use('/api/v1/auth', router)
  app.use(errorHandler)

  return app
}

test('auth flow keeps endpoint contracts for signup, login, refresh, logout', async () => {
  const loginRefreshToken = 'test-refresh-token'

  const serviceDouble = {
    signup: async () => ({
      message: 'Konto założone pomyślnie! Możesz się teraz zalogować',
    }),
    login: async () => ({
      accessToken: 'access-token',
      refreshToken: loginRefreshToken,
      isNewPlayer: false,
    }),
    refresh: async (refreshToken) => {
      assert.equal(refreshToken, loginRefreshToken)
      return { accessToken: 'new-access-token' }
    },
    logout: (refreshToken) => {
      if (!refreshToken) {
        return { statusCode: 204 }
      }

      return { statusCode: 200, message: 'Cookie cleared' }
    },
  }

  const app = createAuthTestApp(serviceDouble)

  const signupResponse = await request(app).post('/api/v1/auth/signup').send({
    email: 'tester@example.com',
    playerName: 'tester',
    password: 'secret123',
    race: 'human',
  })
  assert.equal(signupResponse.status, 200)
  assert.equal(
    signupResponse.body.message,
    'Konto założone pomyślnie! Możesz się teraz zalogować'
  )

  const loginResponse = await request(app).post('/api/v1/auth/login').send({
    email: 'tester@example.com',
    password: 'secret123',
  })
  assert.equal(loginResponse.status, 200)
  assert.equal(loginResponse.body.accessToken, 'access-token')
  assert.equal(loginResponse.body.isNewPlayer, false)
  assert.ok(Array.isArray(loginResponse.headers['set-cookie']))
  assert.match(loginResponse.headers['set-cookie'][0], /jwt=test-refresh-token/)
  assert.match(loginResponse.headers['set-cookie'][0], /HttpOnly/)
  assert.match(loginResponse.headers['set-cookie'][0], /Secure/)
  assert.match(loginResponse.headers['set-cookie'][0], /SameSite=None/)

  const refreshResponse = await request(app)
    .get('/api/v1/auth/refresh')
    .set('Cookie', `jwt=${loginRefreshToken}`)
  assert.equal(refreshResponse.status, 200)
  assert.equal(refreshResponse.body.accessToken, 'new-access-token')

  const logoutResponse = await request(app)
    .post('/api/v1/auth/logout')
    .set('Cookie', `jwt=${loginRefreshToken}`)
    .send({})
  assert.equal(logoutResponse.status, 200)
  assert.equal(logoutResponse.body.message, 'Cookie cleared')
  assert.match(logoutResponse.headers['set-cookie'][0], /jwt=;/)

  const logoutWithoutCookieResponse = await request(app)
    .post('/api/v1/auth/logout')
    .send({})
  assert.equal(logoutWithoutCookieResponse.status, 204)
})

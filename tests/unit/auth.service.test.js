import test from 'node:test'
import assert from 'node:assert/strict'
import { createAuthService } from '../../src/modules/auth/auth.service.js'

const createSessionDouble = () => {
  const state = {
    withTransactionCalls: 0,
    ended: false,
  }

  const session = {
    withTransaction: async (executor) => {
      state.withTransactionCalls += 1
      await executor()
    },
    endSession: async () => {
      state.ended = true
    },
  }

  return { session, state }
}

test('auth service signup creates player and logs in one transaction', async () => {
  const calls = []
  const fakePlayer = {
    _id: 'player-1',
    notifications: [],
    friends: {},
  }

  const repository = {
    findByEmailOrPlayerName: async () => null,
    createPlayer: async (payload, session) => {
      calls.push({ type: 'createPlayer', payload, session })
      return fakePlayer
    },
    createSignupLogs: async (playerId, session) => {
      calls.push({ type: 'createSignupLogs', playerId, session })
    },
    savePlayer: async (player, session) => {
      calls.push({ type: 'savePlayer', player, session })
    },
  }

  const { session, state } = createSessionDouble()

  const service = createAuthService({
    repository,
    hashProvider: {
      hash: async () => 'hashed-password',
      compare: async () => true,
    },
    tokenProvider: {},
    sessionProvider: {
      startSession: async () => session,
    },
  })

  const response = await service.signup({
    email: 'tester@example.com',
    playerName: 'tester',
    password: 'secret123',
    race: 'human',
    avatar: '/avatar.png',
  })

  assert.equal(response.message, 'Konto założone pomyślnie! Możesz się teraz zalogować')
  assert.equal(state.withTransactionCalls, 1)
  assert.equal(state.ended, true)
  assert.equal(calls.length, 3)
  assert.equal(calls[0].type, 'createPlayer')
  assert.equal(calls[1].type, 'createSignupLogs')
  assert.equal(calls[2].type, 'savePlayer')
  assert.deepEqual(fakePlayer.friends, { pending: [], list: [] })
  assert.equal(fakePlayer.notifications[0]?.type, 'message')
})

test('auth service signup closes session and bubbles transaction errors', async () => {
  let savePlayerCalled = false
  const expectedError = new Error('questlog insert failed')

  const repository = {
    findByEmailOrPlayerName: async () => null,
    createPlayer: async () => ({ _id: 'player-2' }),
    createSignupLogs: async () => {
      throw expectedError
    },
    savePlayer: async () => {
      savePlayerCalled = true
    },
  }

  const { session, state } = createSessionDouble()

  const service = createAuthService({
    repository,
    hashProvider: {
      hash: async () => 'hashed-password',
      compare: async () => true,
    },
    tokenProvider: {},
    sessionProvider: {
      startSession: async () => session,
    },
  })

  await assert.rejects(
    () =>
      service.signup({
        email: 'tester2@example.com',
        playerName: 'tester2',
        password: 'secret123',
      }),
    expectedError
  )

  assert.equal(savePlayerCalled, false)
  assert.equal(state.ended, true)
})

test('auth service login returns access and refresh tokens', async () => {
  const repository = {
    findByEmailOrPlayerName: async () => null,
    findByEmail: async () => ({
      _id: '507f1f77bcf86cd799439011',
      email: 'tester@example.com',
      playerName: 'Tester',
      password: 'hashed-password',
      tutorial: 0,
    }),
    createPlayer: async () => {
      throw new Error('not used')
    },
    createSignupLogs: async () => {
      throw new Error('not used')
    },
    savePlayer: async () => {
      throw new Error('not used')
    },
  }

  const service = createAuthService({
    repository,
    hashProvider: {
      hash: async () => 'hashed-password',
      compare: async () => true,
    },
    tokenProvider: {
      createAccessToken: () => 'access-token',
      createRefreshToken: () => 'refresh-token',
      verifyRefreshToken: () => ({}),
    },
    sessionProvider: {
      startSession: async () => {
        throw new Error('not used')
      },
    },
  })

  const response = await service.login({
    email: 'tester@example.com',
    password: 'secret123',
  })

  assert.deepEqual(response, {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    isNewPlayer: true,
  })
})

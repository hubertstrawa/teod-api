import test from 'node:test'
import assert from 'node:assert/strict'
import { createPlayerService } from '../../src/modules/player/player.service.js'
import { createPlayerEventBus, PLAYER_EVENTS } from '../../src/modules/player/player.events.js'

test('player service updateMe applies field whitelist', async () => {
  const calls = []
  const repository = {
    updateByEmail: async (email, payload) => {
      calls.push({ email, payload })
      return { matchedCount: 1 }
    },
  }

  const service = createPlayerService({
    repository,
    eventBus: createPlayerEventBus(),
  })

  const response = await service.updateMe({
    email: 'tester@example.com',
    payload: {
      avatar: '/avatars/new.png',
      money: 999999,
      friends: { list: ['507f1f77bcf86cd799439011'] },
    },
  })

  assert.deepEqual(response, { data: 'User updated' })
  assert.deepEqual(calls, [
    {
      email: 'tester@example.com',
      payload: { avatar: '/avatars/new.png' },
    },
  ])
})

test('player service acceptFriendsInvitation handles pending index 0 and emits event', async () => {
  const eventBus = createPlayerEventBus()
  const emittedEvents = []
  eventBus.on(PLAYER_EVENTS.FRIEND_ACCEPTED, (payload) => emittedEvents.push(payload))

  const player = {
    _id: '507f1f77bcf86cd799439011',
    playerName: 'Receiver',
    friends: {
      pending: ['507f1f77bcf86cd799439012'],
      list: [],
    },
    notifications: [
      {
        type: 'friendsRequest',
        sender: '507f1f77bcf86cd799439012',
      },
    ],
  }
  const playerToAccept = {
    _id: '507f1f77bcf86cd799439012',
    playerName: 'Sender',
    friends: {
      pending: [],
      list: [],
    },
    notifications: [],
  }

  const savedPlayers = []
  const repository = {
    findFriendsContextByEmail: async () => player,
    findFriendsContextById: async () => playerToAccept,
    savePlayer: async (doc) => {
      savedPlayers.push(doc.playerName)
      return doc
    },
  }

  const service = createPlayerService({ repository, eventBus })

  const response = await service.acceptFriendsInvitation({
    email: 'receiver@example.com',
    senderId: '507f1f77bcf86cd799439012',
  })

  assert.equal(response.message, 'Gracz dodany do znajomych')
  assert.deepEqual(player.friends.pending, [])
  assert.deepEqual(player.friends.list, ['507f1f77bcf86cd799439012'])
  assert.deepEqual(player.notifications, [])
  assert.deepEqual(playerToAccept.friends.list, ['507f1f77bcf86cd799439011'])
  assert.deepEqual(savedPlayers, ['Receiver', 'Sender'])
  assert.deepEqual(emittedEvents, [
    {
      receiverPlayerName: 'Receiver',
      receiverFriendName: 'Sender',
      senderPlayerName: 'Sender',
      acceptedByPlayerName: 'Receiver',
    },
  ])
})

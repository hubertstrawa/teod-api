import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createPlayerEventBus,
  PLAYER_EVENTS,
} from '../../src/modules/player/player.events.js'
import { registerPlayerRealtimeHandlers } from '../../src/realtime/handlers/playerRealtimeHandlers.js'

test('player realtime emits socket event after friend invite', () => {
  const emittedEvents = []
  const io = {
    sockets: {
      sockets: new Map([
        ['socket-receiver', { player: { playerName: 'Receiver' } }],
        ['socket-sender', { player: { playerName: 'Sender' } }],
      ]),
    },
    to: (socketId) => ({
      emit: (eventName, payload) => {
        emittedEvents.push({ socketId, eventName, payload })
      },
    }),
  }

  const eventBus = createPlayerEventBus()
  const unsubscribe = registerPlayerRealtimeHandlers(io, { eventBus })

  eventBus.emit(PLAYER_EVENTS.FRIEND_INVITED, {
    receiverPlayerName: 'Receiver',
    senderPlayerName: 'Sender',
  })

  unsubscribe()

  assert.deepEqual(emittedEvents, [
    {
      socketId: 'socket-receiver',
      eventName: 'friends_request',
      payload: 'Gracz Sender wysłał Ci zaproszenie do znajomych',
    },
  ])
})

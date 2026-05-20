import { EventEmitter } from 'node:events'

export const PLAYER_EVENTS = Object.freeze({
  FRIEND_INVITED: 'friend.invited',
  FRIEND_ACCEPTED: 'friend.accepted',
})

export const createPlayerEventBus = () => new EventEmitter()

const playerEvents = createPlayerEventBus()
export default playerEvents

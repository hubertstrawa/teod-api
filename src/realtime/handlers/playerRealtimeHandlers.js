import playerEvents, { PLAYER_EVENTS } from '../../modules/player/player.events.js'

const getSocketIdForPlayer = (playerName, socketsMap) => {
  if (!socketsMap) {
    return undefined
  }

  for (const [socketId, socket] of socketsMap.entries()) {
    if (socket?.player?.playerName === playerName) {
      return socketId
    }
  }

  return undefined
}

export const registerPlayerRealtimeHandlers = (io, { eventBus = playerEvents } = {}) => {
  const onFriendInvited = ({ receiverPlayerName, senderPlayerName }) => {
    const playerSocketId = getSocketIdForPlayer(receiverPlayerName, io?.sockets?.sockets)

    if (!playerSocketId) {
      return
    }

    io.to(playerSocketId).emit(
      'friends_request',
      `Gracz ${senderPlayerName} wysłał Ci zaproszenie do znajomych`
    )
  }

  const onFriendAccepted = ({
    receiverPlayerName,
    receiverFriendName,
    senderPlayerName,
    acceptedByPlayerName,
  }) => {
    const receiverSocketId = getSocketIdForPlayer(receiverPlayerName, io?.sockets?.sockets)

    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        'friends_request',
        `Gracz ${receiverFriendName} został dodany do znajomych`
      )
    }

    const senderSocketId = getSocketIdForPlayer(senderPlayerName, io?.sockets?.sockets)

    if (senderSocketId) {
      io.to(senderSocketId).emit(
        'friends_request',
        `Gracz ${acceptedByPlayerName} zaakceptował zaproszenie`
      )
    }
  }

  eventBus.on(PLAYER_EVENTS.FRIEND_INVITED, onFriendInvited)
  eventBus.on(PLAYER_EVENTS.FRIEND_ACCEPTED, onFriendAccepted)

  return () => {
    eventBus.off(PLAYER_EVENTS.FRIEND_INVITED, onFriendInvited)
    eventBus.off(PLAYER_EVENTS.FRIEND_ACCEPTED, onFriendAccepted)
  }
}

export default registerPlayerRealtimeHandlers

import ApiError from '../../shared/errors/ApiError.js'
import getLootFromEnemy from '../../../utils/getLootFromEnemy.js'
import playerRepository from './player.repository.js'
import playerEvents, { PLAYER_EVENTS } from './player.events.js'

const ALLOWED_UPDATE_ME_FIELDS = ['tutorial', 'avatar', 'playerName']

const hasPlayerInCollection = (collection = [], playerId) =>
  collection.some(
    (value) =>
      String(value) === String(playerId) || String(value?.senderId) === String(playerId)
  )

const pickAllowedFields = (payload = {}) =>
  ALLOWED_UPDATE_ME_FIELDS.reduce((accumulator, field) => {
    if (Object.hasOwn(payload, field)) {
      accumulator[field] = payload[field]
    }

    return accumulator
  }, {})

export const createPlayerService = ({
  repository = playerRepository,
  eventBus = playerEvents,
} = {}) => {
  const getMe = async ({ email }) => {
    const currentUser = await repository.findMeByEmail(email)

    if (!currentUser) {
      throw ApiError.badRequest('Nie udało się pobrać info o current graczu')
    }

    return { data: currentUser }
  }

  const getPlayersHighscores = async () => {
    const players = await repository.findPlayersHighscores()
    return { data: players }
  }

  const getSinglePlayer = async ({ playerName }) => {
    const playerFound = await repository.findSingleByPlayerName(playerName)
    return { data: playerFound }
  }

  const updateMe = async ({ email, payload }) => {
    const safePayload = pickAllowedFields(payload)

    if (Object.keys(safePayload).length === 0) {
      throw ApiError.badRequest('Nie udało się zaktualizować gracza')
    }

    const result = await repository.updateByEmail(email, safePayload)

    if (!result?.matchedCount) {
      throw ApiError.badRequest('Nie udało się zaktualizować gracza')
    }

    return { data: 'User updated' }
  }

  const setNotificationRead = async ({ email, notificationId }) => {
    const player = await repository.findPlayerByEmailSanitized(email)

    if (!player) {
      throw ApiError.badRequest('Nie udało się pobrać info o current graczu')
    }

    const index = player.notifications.findIndex(
      (notification) => String(notification._id) === String(notificationId)
    )

    if (index < 0) {
      throw ApiError.badRequest('Nie udało się ustawić notyfikacji')
    }

    player.notifications[index].isRead = true
    await repository.savePlayer(player)
    return { success: true }
  }

  const addAttribute = async ({ email, attributeName }) => {
    const player = await repository.findPlayerByEmail(email)

    if (!player) {
      throw ApiError.badRequest('Nie udalo sie dodać atrybutu')
    }

    if (attributeName === 'strength') {
      const cost = Math.pow(player.attributes.strength, 2)
      if (player.money < cost) {
        throw ApiError.badRequest('Nie masz wystarczająco złota')
      }
      player.attributes.strength = player.attributes.strength + 1
      player.money = player.money - cost
    }

    if (attributeName === 'intelligence') {
      const cost = Math.pow(player.attributes.intelligence, 2)
      if (player.money < cost) {
        throw ApiError.badRequest('Nie masz wystarczająco złota')
      }
      player.attributes.intelligence = player.attributes.intelligence + 1
      player.money = player.money - cost
    }

    if (attributeName === 'vitality') {
      const cost = Math.pow(player.attributes.vitality, 2)
      if (player.money < cost) {
        throw ApiError.badRequest('Nie masz wystarczająco złota')
      }
      player.attributes.vitality = player.attributes.vitality + 1
      player.maxHealthPoints = player.maxHealthPoints + 2
      player.money = player.money - cost
    }

    if (attributeName === 'accuracy') {
      const cost = Math.pow(player.attributes.accuracy, 2)
      if (player.money < cost) {
        throw ApiError.badRequest('Nie masz wystarczająco złota')
      }
      player.attributes.accuracy = player.attributes.accuracy + 1
      player.money = player.money - cost
    }

    if (attributeName === 'agility') {
      const cost = Math.pow(player.attributes.agility, 2)
      if (player.money < cost) {
        throw ApiError.badRequest('Nie masz wystarczająco złota')
      }
      player.attributes.agility = player.attributes.agility + 1
      player.money = player.money - cost
    }

    await repository.savePlayer(player)
    return { data: 'Zwiększono atrybut' }
  }

  const startJob = async ({ playerId, locationName }) => {
    const player = await repository.findPlayerById(playerId)

    if (!player) {
      throw ApiError.badRequest('Nie udalo sie podjac akcji')
    }

    if (locationName === 'forgotten-forest') {
      player.activeJob = {
        jobId: 1,
        name: 'Zaginiony las',
        location: 'forgotten-forest',
        possibleLoot: [
          { id: '63e965bbecbb4c981ca98880', chance: 20 },
          { id: '63e965bbecbb4c981ca98881', chance: 20 },
          { id: '64198dc4498996fb93e194b5', chance: 20 },
          { id: '6419915d498996fb93e194b6', chance: 20 },
          { id: '642353e6483b9202619f6095', chance: 20 },
        ],
      }
    }

    await repository.savePlayer(player)
    return { message: 'Rozpoczęto akcję' }
  }

  const finishJob = async ({ playerId }) => {
    const player = await repository.findPlayerById(playerId)

    if (!player) {
      throw ApiError.badRequest('Nie udalo sie zakończyć akcji')
    }

    player.markModified('activeJob')

    if (
      new Date(new Date().toUTCString()).getTime() >=
      new Date(player?.activeJob?.timeEnd).getTime()
    ) {
      const lootedItem = getLootFromEnemy(player.activeJob.possibleLoot)
      player.inventory.all.push(lootedItem.id)
      const item = await repository.findItemById(lootedItem.id)
      player.manaPoints = player.maxManaPoints
      player.healthPoints = player.maxHealthPoints
      player.energy = 100
      player.activeJob = null
      await repository.savePlayer(player)
      return { message: 'Zakończono akcję!', item }
    }

    throw ApiError.badRequest('Nie mozna zakonczyc akcji')
  }

  const closeJob = async ({ playerId }) => {
    const player = await repository.findPlayerById(playerId)

    if (!player) {
      throw ApiError.badRequest('Nie udalo sie przerwać poszukiwań')
    }

    player.markModified('activeJob')
    player.activeJob = null
    await repository.savePlayer(player)
    return { message: 'Przerwano poszukiwania' }
  }

  const inviteToFriends = async ({ email, playerName }) => {
    const player = await repository.findFriendsContextByEmail(email)
    const playerInvited = await repository.findFriendsContextByPlayerName(playerName)

    if (!player || !playerInvited) {
      throw ApiError.badRequest('Nie udało się wysłać zaproszenia')
    }

    if (
      playerName === player.playerName ||
      hasPlayerInCollection(player.friends.list, playerInvited._id) ||
      hasPlayerInCollection(player.friends.pending, playerInvited._id)
    ) {
      throw ApiError.badRequest('Coś poszło nie tak')
    }

    if (hasPlayerInCollection(playerInvited.friends.list, player._id)) {
      throw ApiError.badRequest('Masz już tego gracza w znajomych')
    }

    if (hasPlayerInCollection(playerInvited.friends.pending, player._id)) {
      throw ApiError.badRequest('Wysłano już zaproszenie do tego gracza')
    }

    playerInvited.friends.pending.push(player._id)
    playerInvited.notifications.push({
      type: 'friendsRequest',
      sender: player._id,
      data: `Gracz ${player.playerName} zaprosił/a Cię do znajomych!`,
      isRead: false,
    })

    await repository.savePlayer(playerInvited)

    eventBus.emit(PLAYER_EVENTS.FRIEND_INVITED, {
      receiverPlayerName: playerInvited.playerName,
      senderPlayerName: player.playerName,
    })

    return {
      message: `Wysłano zaproszenie do gracza ${playerName}`,
    }
  }

  const acceptFriendsInvitation = async ({ email, senderId }) => {
    const player = await repository.findFriendsContextByEmail(email)
    const playerToAccept = await repository.findFriendsContextById(senderId)

    if (!player || !playerToAccept) {
      throw ApiError.badRequest('Nie udało się przyjąć zaproszenia')
    }

    const pendingInvitationIndex = player.friends.pending.findIndex(
      (entry) =>
        String(entry) === String(senderId) || String(entry?.senderId) === String(senderId)
    )

    if (pendingInvitationIndex < 0) {
      throw ApiError.badRequest('Nie udało się przyjąć zaproszenia')
    }

    if (!hasPlayerInCollection(player.friends.list, playerToAccept._id)) {
      player.friends.list.push(playerToAccept._id)
    }
    player.friends.pending.splice(pendingInvitationIndex, 1)

    if (!hasPlayerInCollection(playerToAccept.friends.list, player._id)) {
      playerToAccept.friends.list.push(player._id)
    }

    const removePendingNotificationIndex = player.notifications.findIndex(
      (notification) =>
        notification.type === 'friendsRequest' &&
        String(notification.sender) === String(senderId)
    )

    if (removePendingNotificationIndex >= 0) {
      player.notifications.splice(removePendingNotificationIndex, 1)
    }

    await repository.savePlayer(player)
    await repository.savePlayer(playerToAccept)

    eventBus.emit(PLAYER_EVENTS.FRIEND_ACCEPTED, {
      receiverPlayerName: player.playerName,
      receiverFriendName: playerToAccept.playerName,
      senderPlayerName: playerToAccept.playerName,
      acceptedByPlayerName: player.playerName,
    })

    return { message: 'Gracz dodany do znajomych' }
  }

  return {
    getMe,
    getPlayersHighscores,
    getSinglePlayer,
    updateMe,
    setNotificationRead,
    addAttribute,
    startJob,
    finishJob,
    closeJob,
    inviteToFriends,
    acceptFriendsInvitation,
  }
}

const playerService = createPlayerService()
export default playerService

import Item from '../models/Item.js'
import Player from '../models/Player.js'
import getLootFromEnemy from '../utils/getLootFromEnemy.js'
import mongoose from 'mongoose'
import { io } from '../server.js'
import ApiError from '../src/shared/errors/ApiError.js'
import asyncHandler from '../src/shared/http/asyncHandler.js'

const updateMe = asyncHandler(async (req, res) => {
  const email = req.email
  await Player.updateOne({ email }, { ...req.body })
  return res.status(200).json({ data: 'User updated' })
})

const getMe = asyncHandler(async (req, res) => {
  const email = req.email

  const currentUser = await Player.findOne({ email })
    .select('-password -email')
    .populate({ path: 'friends.list', select: 'playerName avatar level' })

  if (!currentUser) {
    throw ApiError.badRequest('Nie udało się pobrać info o current graczu')
  }

  return res.status(200).json({ data: currentUser })
})

const getPlayersHighscores = asyncHandler(async (req, res) => {
  const players = await Player.find()
    .sort({ level: -1 })
    .limit(10)
    .select('-password -email')
  return res.status(200).json({ data: players })
})

const getSinglePlayer = asyncHandler(async (req, res) => {
  const { playerName } = req.query
  const playerFound = await Player.findOne({ playerName })
    .select('-password -email -inventory.all -notifications -friends')
    .populate({
      path: 'inventory',
      populate: {
        path: 'eq.amulet eq.helmet eq.bag eq.weapon eq.armor eq.shield eq.ring eq.belt eq.boots',
      },
    })
  return res.status(200).json({ data: playerFound })
})

const setNotificationRead = asyncHandler(async (req, res) => {
  const email = req.email
  const { notificationId } = req.body

  const id = mongoose.Types.ObjectId(notificationId)
  const player = await Player.findOne({ email }).select('-password -email')
  if (!player) {
    throw ApiError.badRequest('Nie udało się pobrać info o current graczu')
  }

  const index = player.notifications.findIndex((el) => el._id.equals(id))
  player.notifications[index].isRead = true
  await player.save()
  return res.status(200).json({ success: true })
})

// const getPlayerSingle = async (req, res) => {
//   try {
//     const players = await Player.find().sort({ level: -1 }).limit(10)
//     return res.status(200).json({ data: players })
//   } catch (err) {
//     return res.status(400).json({ message: 'Nie udało się danych' })
//   }
// }

const addAttribute = asyncHandler(async (req, res) => {
  const email = req.email
  const { attributeName } = req.body
  const player = await Player.findOne({ email })

  if (!player) {
    throw ApiError.badRequest('Nie udalo sie dodać atrybutu')
  }

  if (
    attributeName !== 'strength' &&
    attributeName !== 'intelligence' &&
    attributeName !== 'vitality' &&
    attributeName !== 'accuracy' &&
    attributeName !== 'agility'
  ) {
    throw ApiError.badRequest('Nie ma takiego atrybutu')
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

  await player.save()
  return res.status(200).json({ data: 'Zwiększono atrybut' })
})

const startJob = asyncHandler(async (req, res) => {
  const playerId = req.id
  const { locationName } = req.body
  const player = await Player.findOne({ _id: playerId })

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
  } else {
    throw ApiError.badRequest('Nie ma takiej lokacji')
  }

  await player.save()
  return res.status(200).json({ message: 'Rozpoczęto akcję' })
})

const finishJob = asyncHandler(async (req, res) => {
  const playerId = req.id
  const player = await Player.findOne({ _id: playerId })

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
    const item = await Item.findOne({ _id: lootedItem.id })
    player.manaPoints = player.maxManaPoints
    player.healthPoints = player.maxHealthPoints
    player.energy = 100
    player.activeJob = null
    await player.save()
    return res.status(200).json({ message: 'Zakończono akcję!', item })
  }

  throw ApiError.badRequest('Nie mozna zakonczyc akcji')
})

const closeJob = asyncHandler(async (req, res) => {
  const playerId = req.id
  const player = await Player.findOne({ _id: playerId })

  if (!player) {
    throw ApiError.badRequest('Nie udalo sie przerwać poszukiwań')
  }

  player.markModified('activeJob')
  player.activeJob = null
  await player.save()
  return res.status(200).json({ message: 'Przerwano poszukiwania' })
})

export const getSocketIdForPlayer = (playerName, socketsMap) => {
  let foundSocketId

  socketsMap.forEach((socket, socketId) => {
    if (playerName === socket.player.playerName) {
      foundSocketId = socketId
    }
    // Perform other actions based on your requirements
  })

  return foundSocketId
}

const inviteToFriends = asyncHandler(async (req, res) => {
  const email = req.email
  const { playerName } = req.body

  const player = await Player.findOne({ email }).select('_id playerName friends')
  const playerInvited = await Player.findOne({ playerName }).select(
    '_id friends notifications'
  )

  if (!player || !playerInvited) {
    throw ApiError.badRequest('Nie udało się wysłać zaproszenia')
  }

  if (
    playerName === player.playerName ||
    player.friends.list.includes(playerInvited._id) ||
    player.friends.pending.includes(playerInvited._id)
  ) {
    throw ApiError.badRequest('Coś poszło nie tak')
  }
  if (playerInvited.friends.list.includes(player._id)) {
    throw ApiError.badRequest('Masz już tego gracza w znajomych')
  }
  if (playerInvited.friends.pending.includes(player._id)) {
    throw ApiError.badRequest('Wysłano już zaproszenie do tego gracza')
  }

  playerInvited.friends.pending.push(player._id)
  playerInvited.notifications.push({
    type: 'friendsRequest',
    sender: player._id,
    data: `Gracz ${player.playerName} zaprosił/a Cię do znajomych!`,
    isRead: false,
  })
  await playerInvited.save()

  const socketsMap = io.sockets.sockets
  const playerSocketIdToEmit = getSocketIdForPlayer(playerName, socketsMap)

  if (playerSocketIdToEmit) {
    io.to(playerSocketIdToEmit).emit(
      'friends_request',
      `Gracz ${player.playerName} wysłał Ci zaproszenie do znajomych`
    )
  }

  return res
    .status(200)
    .json({ message: `Wysłano zaproszenie do gracza ${playerName}` })
})

const acceptFriendsInvitation = asyncHandler(async (req, res) => {
  const email = req.email
  const { senderId } = req.body

  const player = await Player.findOne({ email }).select(
    '_id friends playerName notifications'
  )
  const playerToAccept = await Player.findOne({ _id: senderId }).select(
    '_id friends playerName notifications'
  )

  if (!player || !playerToAccept) {
    throw ApiError.badRequest('Nie udało się przyjąć zaproszenia')
  }

  const pendingInvitationIndex = player.friends.pending.findIndex(
    (el) => el.senderId === senderId
  )
  if (!pendingInvitationIndex) {
    throw ApiError.badRequest('Nie udało się przyjąć zaproszenia')
  }

  player.friends.list.push(playerToAccept._id)
  player.friends.pending.splice(pendingInvitationIndex, 1)
  playerToAccept.friends.list.push(player._id)

  const removePendingNotificationIndex = player.notifications.findIndex(
    (el) => el.type === 'friendsRequest' && el.sender === senderId
  )
  if (removePendingNotificationIndex) {
    player.notifications.splice(removePendingNotificationIndex, 1)
  }

  const socketsMap = io.sockets.sockets
  const playerSocketIdToEmit = getSocketIdForPlayer(player.playerName, socketsMap)

  if (playerSocketIdToEmit) {
    io.to(playerSocketIdToEmit).emit(
      'friends_request',
      `Gracz ${playerToAccept.playerName} został dodany do znajomych`
    )
  }

  const playerToAcceptIdSocket = getSocketIdForPlayer(
    playerToAccept.playerName,
    socketsMap
  )

  if (playerToAcceptIdSocket) {
    io.to(playerToAcceptIdSocket).emit(
      'friends_request',
      `Gracz ${player.playerName} zaakceptował zaproszenie`
    )
  }

  await player.save()
  await playerToAccept.save()

  return res.status(200).json({ message: 'Gracz dodany do znajomych' })
})

export {
  getMe,
  getPlayersHighscores,
  updateMe,
  addAttribute,
  startJob,
  finishJob,
  closeJob,
  setNotificationRead,
  inviteToFriends,
  acceptFriendsInvitation,
  getSinglePlayer,
}

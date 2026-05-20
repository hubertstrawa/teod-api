import asyncHandler from '../../shared/http/asyncHandler.js'
import playerService from './player.service.js'

export const createPlayerController = (service = playerService) => {
  const getMe = asyncHandler(async (req, res) => {
    const response = await service.getMe({ email: req.email })
    return res.status(200).json(response)
  })

  const getPlayersHighscores = asyncHandler(async (_req, res) => {
    const response = await service.getPlayersHighscores()
    return res.status(200).json(response)
  })

  const getSinglePlayer = asyncHandler(async (req, res) => {
    const response = await service.getSinglePlayer({
      playerName: req.query.playerName,
    })
    return res.status(200).json(response)
  })

  const updateMe = asyncHandler(async (req, res) => {
    const response = await service.updateMe({
      email: req.email,
      payload: req.body,
    })

    return res.status(200).json(response)
  })

  const setNotificationRead = asyncHandler(async (req, res) => {
    const response = await service.setNotificationRead({
      email: req.email,
      notificationId: req.body.notificationId,
    })

    return res.status(200).json(response)
  })

  const addAttribute = asyncHandler(async (req, res) => {
    const response = await service.addAttribute({
      email: req.email,
      attributeName: req.body.attributeName,
    })

    return res.status(200).json(response)
  })

  const startJob = asyncHandler(async (req, res) => {
    const response = await service.startJob({
      playerId: req.id,
      locationName: req.body.locationName,
    })

    return res.status(200).json(response)
  })

  const finishJob = asyncHandler(async (req, res) => {
    const response = await service.finishJob({
      playerId: req.id,
    })

    return res.status(200).json(response)
  })

  const closeJob = asyncHandler(async (req, res) => {
    const response = await service.closeJob({
      playerId: req.id,
    })

    return res.status(200).json(response)
  })

  const inviteToFriends = asyncHandler(async (req, res) => {
    const response = await service.inviteToFriends({
      email: req.email,
      playerName: req.body.playerName,
    })

    return res.status(200).json(response)
  })

  const acceptFriendsInvitation = asyncHandler(async (req, res) => {
    const response = await service.acceptFriendsInvitation({
      email: req.email,
      senderId: req.body.senderId,
    })

    return res.status(200).json(response)
  })

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

const playerController = createPlayerController()

export const {
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
} = playerController
export default playerController

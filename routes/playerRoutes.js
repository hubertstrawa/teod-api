import express from 'express'
import {
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
} from '../src/modules/player/player.controller.js'
import verifyJWT from '../middleware/verifyJWT.js'
import validate from '../src/shared/http/validate.js'
import playerSchemas from '../src/modules/player/player.schemas.js'

const router = express.Router()

router.use(verifyJWT)
router.route('/me').get(validate(playerSchemas.getMe), getMe)
router
  .route('/highscores')
  .get(validate(playerSchemas.getPlayersHighscores), getPlayersHighscores)
router.route('/updateMe').patch(validate(playerSchemas.updateMe), updateMe)
router.route('/addAttribute').post(validate(playerSchemas.addAttribute), addAttribute)
router.route('/startJob').post(validate(playerSchemas.startJob), startJob)
router.route('/finishJob').post(validate(playerSchemas.finishJob), finishJob)
router.route('/closeJob').delete(validate(playerSchemas.closeJob), closeJob)
router
  .route('/setNotificationRead')
  .post(validate(playerSchemas.setNotificationRead), setNotificationRead)
router
  .route('/inviteToFriends')
  .post(validate(playerSchemas.inviteToFriends), inviteToFriends)
router
  .route('/acceptFriendsInvitation')
  .post(validate(playerSchemas.acceptFriendsInvitation), acceptFriendsInvitation)
router
  .route('/getSinglePlayer')
  .get(validate(playerSchemas.getSinglePlayer), getSinglePlayer)

const playerRoutes = router
export default playerRoutes

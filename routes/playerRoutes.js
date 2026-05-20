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
} from '../controllers/playerController.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = express.Router()

router.use(verifyJWT)
router.route('/me').get(getMe)
router.route('/highscores').get(getPlayersHighscores)
router.route('/updateMe').patch(updateMe)
router.route('/addAttribute').post(addAttribute)
router.route('/startJob').post(startJob)
router.route('/finishJob').post(finishJob)
router.route('/closeJob').delete(closeJob)
router.route('/setNotificationRead').post(setNotificationRead)
router.route('/inviteToFriends').post(inviteToFriends)
router.route('/acceptFriendsInvitation').post(acceptFriendsInvitation)
router.route('/getSinglePlayer').get(getSinglePlayer)

const playerRoutes = router
export default playerRoutes

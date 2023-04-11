const express = require('express')
const router = express.Router()
const playerController = require('../controllers/playerController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
router.route('/me').get(playerController.getMe)
router.route('/highscores').get(playerController.getPlayersHighscores)
router.route('/updateMe').patch(playerController.updateMe)
router.route('/addAttribute').post(playerController.addAttribute)
router.route('/startJob').post(playerController.startJob)
router.route('/finishJob').post(playerController.finishJob)
router.route('/closeJob').delete(playerController.closeJob)

module.exports = router

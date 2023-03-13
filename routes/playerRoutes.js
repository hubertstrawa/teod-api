const express = require('express')
const router = express.Router()
const playerController = require('../controllers/playerController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
router.route('/me').get(playerController.getMe)
router.route('/highscores').get(playerController.getPlayersHighscores)
router.route('/updateMe').patch(playerController.updateMe)

module.exports = router

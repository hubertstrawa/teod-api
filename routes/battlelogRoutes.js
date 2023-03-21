const express = require('express')
const router = express.Router()
const battlelogController = require('../controllers/battlelogController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
router.route('/startBattle').post(battlelogController.startBattle)
router.route('/attackEnemy').post(battlelogController.attackEnemy)

module.exports = router

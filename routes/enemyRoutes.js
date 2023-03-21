const express = require('express')
const router = express.Router()
const enemyController = require('../controllers/enemyController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
router.route('/getEnemies').get(enemyController.getEnemies)

module.exports = router

const express = require('express')
const router = express.Router()
const playerController = require('../controllers/playerController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
router.route('/me').get(playerController.getMe)
// router.route('/me-inventory').get(playerController.getInventory)
// router.route('/add-to-inventory').post(playerController.addToInventory)
router.route('/updateMe').patch(playerController.updateMe)
// router.route('/updateMe-inventory').patch(playerController.updateInventory)

module.exports = router

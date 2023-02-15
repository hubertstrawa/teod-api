const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const verifyJWT = require('../middleware/verifyJWT')

// router.route('/register').post(authController.register)
router.route('/login').post(authController.login)
router.route('/refresh').get(authController.refresh)

router.use(verifyJWT)
router.route('/me').get(authController.getMe)
router.route('/me-inventory').get(authController.getInventory)
router.route('/add-to-inventory').post(authController.addToInventory)
router.route('/updateMe').patch(authController.updateMe)
router.route('/updateMe-inventory').patch(authController.updateInventory)

router.route('/users').get(authController.getUsers)

module.exports = router

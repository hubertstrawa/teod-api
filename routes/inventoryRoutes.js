const express = require('express')
const router = express.Router()
const inventoryController = require('../controllers/inventoryController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
router.route('/mine').get(inventoryController.getInventory)
router.route('/addInventory').post(inventoryController.addToInventory)
router.route('/updateInventory').patch(inventoryController.updateInventory)
router.route('/buyItem').post(inventoryController.buyItem)

module.exports = router

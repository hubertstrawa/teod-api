const express = require('express')
const router = express.Router()
const inventoryController = require('../controllers/inventoryController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
router.route('/mine').get(inventoryController.getInventory)
router.route('/addInventory').post(inventoryController.addToInventory)
router.route('/updateInventory').patch(inventoryController.updateInventory)
router.route('/eatFood').post(inventoryController.eatFood)
router.route('/equipItem').post(inventoryController.equipItem)
router.route('/unequipItem').post(inventoryController.unequipItem)
router.route('/getItemsSell').get(inventoryController.getItemSell)
router.route('/buyItem').post(inventoryController.buyItem)
router.route('/sellItem').post(inventoryController.sellItem)

module.exports = router

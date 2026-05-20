import express from 'express'

import {
  getInventory,
  addToInventory,
  updateInventory,
  eatFood,
  equipItem,
  unequipItem,
  getItemSell,
  buyItem,
  sellItem,
} from '../controllers/inventoryController.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = express.Router()

router.use(verifyJWT)
router.route('/mine').get(getInventory)
router.route('/addInventory').post(addToInventory)
router.route('/updateInventory').patch(updateInventory)
router.route('/eatFood').post(eatFood)
router.route('/equipItem').post(equipItem)
router.route('/unequipItem').post(unequipItem)
router.route('/getItemsSell').get(getItemSell)
router.route('/buyItem').post(buyItem)
router.route('/sellItem').post(sellItem)

const inventoryRoutes = router
export default inventoryRoutes

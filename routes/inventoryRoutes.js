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
} from '../src/modules/inventory/inventory.controller.js'
import verifyJWT from '../middleware/verifyJWT.js'
import validate from '../src/shared/http/validate.js'
import inventorySchemas from '../src/modules/inventory/inventory.schemas.js'

const router = express.Router()

router.use(verifyJWT)
router.route('/mine').get(validate(inventorySchemas.getInventory), getInventory)
router.route('/addInventory').post(validate(inventorySchemas.addToInventory), addToInventory)
router
  .route('/updateInventory')
  .patch(validate(inventorySchemas.updateInventory), updateInventory)
router.route('/eatFood').post(validate(inventorySchemas.eatFood), eatFood)
router.route('/equipItem').post(validate(inventorySchemas.equipItem), equipItem)
router.route('/unequipItem').post(validate(inventorySchemas.unequipItem), unequipItem)
router.route('/getItemsSell').get(validate(inventorySchemas.getItemSell), getItemSell)
router.route('/buyItem').post(validate(inventorySchemas.buyItem), buyItem)
router.route('/sellItem').post(validate(inventorySchemas.sellItem), sellItem)

const inventoryRoutes = router
export default inventoryRoutes

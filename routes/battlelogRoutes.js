import express from 'express'
import {
  getBattlelog,
  getFullBattlelog,
  startBattle,
  attackEnemy,
  getEnemyPlayerData,
} from '../controllers/battlelogController.js'
import verifyJWT from '../middleware/verifyJWT.js'
const router = express.Router()

router.use(verifyJWT)
router.route('/getBattlelog').get(getBattlelog)
router.route('/getFullBattlelog').get(getFullBattlelog)
router.route('/startBattle').post(startBattle)
router.route('/attackEnemy').post(attackEnemy)
router.route('/getEnemyPlayerData').get(getEnemyPlayerData)

const battlelogRoutes = router
export default battlelogRoutes

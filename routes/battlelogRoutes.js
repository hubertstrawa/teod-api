import express from 'express'
import {
  getBattlelog,
  getFullBattlelog,
  startBattle,
  attackEnemy,
  getEnemyPlayerData,
} from '../src/modules/battlelog/battlelog.controller.js'
import verifyJWT from '../middleware/verifyJWT.js'
import validate from '../src/shared/http/validate.js'
import battlelogSchemas from '../src/modules/battlelog/battlelog.schemas.js'
const router = express.Router()

router.use(verifyJWT)
router.route('/getBattlelog').get(validate(battlelogSchemas.getBattlelog), getBattlelog)
router
  .route('/getFullBattlelog')
  .get(validate(battlelogSchemas.getFullBattlelog), getFullBattlelog)
router.route('/startBattle').post(validate(battlelogSchemas.startBattle), startBattle)
router.route('/attackEnemy').post(validate(battlelogSchemas.attackEnemy), attackEnemy)
router
  .route('/getEnemyPlayerData')
  .get(validate(battlelogSchemas.getEnemyPlayerData), getEnemyPlayerData)

const battlelogRoutes = router
export default battlelogRoutes

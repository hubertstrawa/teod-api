import express from 'express'
import { getEnemies, getSingleEnemy } from '../src/modules/enemy/enemy.controller.js'
import verifyJWT from '../middleware/verifyJWT.js'
import validate from '../src/shared/http/validate.js'
import enemySchemas from '../src/modules/enemy/enemy.schemas.js'

const router = express.Router()

router.use(verifyJWT)
router.route('/getEnemies').get(validate(enemySchemas.getEnemies), getEnemies)
router
  .route('/getSingleEnemy')
  .get(validate(enemySchemas.getSingleEnemy), getSingleEnemy)

const enemyRoutes = router
export default enemyRoutes

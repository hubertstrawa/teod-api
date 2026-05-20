import express from 'express'
import { getEnemies, getSingleEnemy } from '../controllers/enemyController.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = express.Router()

router.use(verifyJWT)
router.route('/getEnemies').get(getEnemies)
router.route('/getSingleEnemy').get(getSingleEnemy)

const enemyRoutes = router
export default enemyRoutes

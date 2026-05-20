import express from 'express'
import {
  getPlayerQuestlog,
  startQuest,
  finishQuest,
} from '../controllers/questlogController.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = express.Router()

router.use(verifyJWT)
router.route('/getPlayerQuestlog').get(getPlayerQuestlog)
router.route('/startQuest').post(startQuest)
router.route('/finishQuest').post(finishQuest)

const questlogRoutes = router
export default questlogRoutes

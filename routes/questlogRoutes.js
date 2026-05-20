import express from 'express'
import {
  getPlayerQuestlog,
  startQuest,
  finishQuest,
} from '../src/modules/questlog/questlog.controller.js'
import verifyJWT from '../middleware/verifyJWT.js'
import validate from '../src/shared/http/validate.js'
import questlogSchemas from '../src/modules/questlog/questlog.schemas.js'

const router = express.Router()

router.use(verifyJWT)
router
  .route('/getPlayerQuestlog')
  .get(validate(questlogSchemas.getPlayerQuestlog), getPlayerQuestlog)
router.route('/startQuest').post(validate(questlogSchemas.startQuest), startQuest)
router.route('/finishQuest').post(validate(questlogSchemas.finishQuest), finishQuest)

const questlogRoutes = router
export default questlogRoutes

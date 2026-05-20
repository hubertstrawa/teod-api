import express from 'express'
import {
  getTasks,
  getPlayerTasklog,
  startTask,
  finishTask,
  closeTask,
} from '../src/modules/tasklog/tasklog.controller.js'
import verifyJWT from '../middleware/verifyJWT.js'
import validate from '../src/shared/http/validate.js'
import tasklogSchemas from '../src/modules/tasklog/tasklog.schemas.js'

const router = express.Router()

router.use(verifyJWT)
router.route('/getTasks').get(validate(tasklogSchemas.getTasks), getTasks)
router
  .route('/getPlayerTasklog')
  .get(validate(tasklogSchemas.getPlayerTasklog), getPlayerTasklog)
router.route('/startTask').post(validate(tasklogSchemas.startTask), startTask)
router.route('/finishTask').post(validate(tasklogSchemas.finishTask), finishTask)
router.route('/closeTask').delete(validate(tasklogSchemas.closeTask), closeTask)

const tasklogRoutes = router
export default tasklogRoutes

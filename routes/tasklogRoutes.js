import express from 'express'
import {
  getTasks,
  getPlayerTasklog,
  startTask,
  finishTask,
  closeTask,
} from '../controllers/tasklogController.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = express.Router()

router.use(verifyJWT)
router.route('/getTasks').get(getTasks)
router.route('/getPlayerTasklog').get(getPlayerTasklog)
router.route('/startTask').post(startTask)
router.route('/finishTask').post(finishTask)
router.route('/closeTask').delete(closeTask)

const tasklogRoutes = router
export default tasklogRoutes

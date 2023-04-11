const express = require('express')
const router = express.Router()
const tasklogController = require('../controllers/tasklogController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
router.route('/getTasks').get(tasklogController.getTasks)
router.route('/getPlayerTasklog').get(tasklogController.getPlayerTasklog)
router.route('/startTask').post(tasklogController.startTask)
router.route('/finishTask').post(tasklogController.finishTask)
router.route('/closeTask').delete(tasklogController.closeTask)

module.exports = router

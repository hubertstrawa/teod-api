const express = require('express')
const router = express.Router()
const questlogController = require('../controllers/questlogController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
router.route('/getPlayerQuestlog').get(questlogController.getPlayerQuestlog)
router.route('/startQuest').post(questlogController.startQuest)
router.route('/finishQuest').post(questlogController.finishQuest)

module.exports = router

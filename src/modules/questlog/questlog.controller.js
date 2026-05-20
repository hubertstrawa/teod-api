import asyncHandler from '../../shared/http/asyncHandler.js'
import questlogService from './questlog.service.js'

export const createQuestlogController = (service = questlogService) => {
  const getPlayerQuestlog = asyncHandler(async (req, res) => {
    const response = await service.getPlayerQuestlog({ playerId: req.id })
    return res.status(200).json(response)
  })

  const startQuest = asyncHandler(async (req, res) => {
    const response = await service.startQuest({
      playerId: req.id,
      questId: req.body.questId,
    })
    return res.status(200).json(response)
  })

  const finishQuest = asyncHandler(async (req, res) => {
    const response = await service.finishQuest({
      playerId: req.id,
      questId: req.body.questId,
    })
    return res.status(200).json(response)
  })

  return { getPlayerQuestlog, startQuest, finishQuest }
}

const questlogController = createQuestlogController()
export const { getPlayerQuestlog, startQuest, finishQuest } = questlogController
export default questlogController

import Player from '../../../models/Player.js'
import Questlog from '../../../models/Questlog.js'
import Quest from '../../../models/Quest.js'

export const createQuestlogRepository = ({
  playerModel = Player,
  questlogModel = Questlog,
  questModel = Quest,
} = {}) => {
  const findQuestlogWithRelationsByPlayerId = (playerId) =>
    questlogModel.findOne({ playerId }).populate({
      path: 'activeQuests completedQuests',
      populate: {
        path: 'requiredItems rewardItems',
      },
    })

  const findQuestlogByPlayerId = (playerId) => questlogModel.findOne({ playerId })
  const findQuestById = (questId) => questModel.findOne({ _id: questId })
  const findPlayerById = (playerId) => playerModel.findOne({ _id: playerId })
  const saveQuestlog = (questlog) => questlog.save()
  const savePlayer = (player) => player.save()

  return {
    findQuestlogWithRelationsByPlayerId,
    findQuestlogByPlayerId,
    findQuestById,
    findPlayerById,
    saveQuestlog,
    savePlayer,
  }
}

const questlogRepository = createQuestlogRepository()
export default questlogRepository

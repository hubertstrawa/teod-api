import ApiError from '../../shared/errors/ApiError.js'
import logger from '../../shared/logger/logger.js'
import questlogRepository from './questlog.repository.js'

const hasRequiredItems = (inventory, requiredItems) => {
  const itemCounts = {}
  for (const item of inventory) {
    if (requiredItems.includes(item)) {
      itemCounts[item] = (itemCounts[item] || 0) + 1
    }
  }

  for (const itemObj of requiredItems) {
    const item = itemObj.toString()

    if (
      !(item in itemCounts) ||
      itemCounts[item] < requiredItems.filter((i) => i.toString() === item).length
    ) {
      return false
    } else {
      return true
    }
  }
}

export const createQuestlogService = ({ repository = questlogRepository } = {}) => {
  const getPlayerQuestlog = async ({ playerId }) => {
    const questlog = await repository.findQuestlogWithRelationsByPlayerId(playerId)
    return { data: questlog }
  }

  const startQuest = async ({ playerId, questId }) => {
    const questlog = await repository.findQuestlogByPlayerId(playerId)

    if (!questlog) {
      throw ApiError.badRequest('Nie udalo sie rozpoczac zadania')
    }

    const hasQuest = [...questlog.activeQuests, ...questlog.completedQuests].findIndex(
      (el) => el._id.toString() === questId
    )

    if (hasQuest !== -1) {
      throw ApiError.badRequest('Nie udalo sie dodac questa (jest juz wykonany)')
    }

    questlog.activeQuests.push({ _id: questId })
    await repository.saveQuestlog(questlog)
    return { message: 'Rozpoczęto nowy quest' }
  }

  const finishQuest = async ({ playerId, questId }) => {
    const [questlog, quest, player] = await Promise.all([
      repository.findQuestlogByPlayerId(playerId),
      repository.findQuestById(questId),
      repository.findPlayerById(playerId),
    ])

    if (!questlog || !quest || !player) {
      throw ApiError.badRequest('Nie udało się zakończyć zadania')
    }

    const hasQuest = questlog.completedQuests.findIndex((el) => el._id.toString() === questId)

    const hasItems = hasRequiredItems(player.inventory.all, quest.requiredItems)
    logger.debug('Quest completion check', { playerId, questId, hasItems })

    if (hasQuest !== -1) {
      throw ApiError.badRequest('Nie udalo sie zakonzcyc questa (jest juz zrobiony)')
    }

    if (!hasItems) {
      throw ApiError.badRequest('Nie spelniasz wymagan')
    }

    for (const requiredItem of quest.requiredItems) {
      const index = player.inventory.all.findIndex(
        (el) => el.toString() === requiredItem.toString()
      )

      player.inventory.all.splice(index, 1)
    }

    if (quest.rewardMoney) {
      player.money = player.money + quest.rewardMoney
    }

    if (quest.rewardExp) {
      player.experience = player.experience + quest.rewardExp
    }

    if (quest.rewardItems.length) {
      quest.rewardItems.forEach((item) => {
        player.inventory.all.push(item)
      })
    }

    const newActiveQuest = questlog.activeQuests.filter((aq) => aq._id.toString() !== questId)

    questlog.activeQuests = newActiveQuest
    questlog.completedQuests = [...questlog.completedQuests, { _id: questId }]

    await repository.saveQuestlog(questlog)
    await repository.savePlayer(player)

    return { message: 'Zakończono zadanie' }
  }

  return { getPlayerQuestlog, startQuest, finishQuest }
}

const questlogService = createQuestlogService()
export default questlogService

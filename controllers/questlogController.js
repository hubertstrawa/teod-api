import Player from '../models/Player.js'
import Questlog from '../models/Questlog.js'
import Quest from '../models/Quest.js'
import ApiError from '../src/shared/errors/ApiError.js'
import asyncHandler from '../src/shared/http/asyncHandler.js'
import logger from '../src/shared/logger/logger.js'

const getPlayerQuestlog = asyncHandler(async (req, res) => {
  const playerId = req.id

  const questlog = await Questlog.findOne({ playerId }).populate({
    path: 'activeQuests completedQuests',
    populate: {
      path: 'requiredItems rewardItems',
    },
  })

  return res.status(200).json({ data: questlog })
})

const startQuest = asyncHandler(async (req, res) => {
  const { questId } = req.body
  const playerId = req.id
  const questlog = await Questlog.findOne({ playerId })

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
  await questlog.save()
  return res.status(200).json({ message: 'Rozpoczęto nowy quest' })
})

const hasRequiredItems = (inventory, requiredItems) => {
  // Count occurrences of each required item in inventory
  const itemCounts = {}
  for (const item of inventory) {
    if (requiredItems.includes(item)) {
      itemCounts[item] = (itemCounts[item] || 0) + 1
    }
  }

  // Check that inventory has enough of each required item
  // requiredItems.filter((i) => i === item).length
  for (const itemObj of requiredItems) {
    const item = itemObj.toString()

    if (
      !(item in itemCounts) ||
      itemCounts[item] <
        requiredItems.filter((i) => i.toString() === item).length
    ) {
      return false
    } else {
      return true
    }
  }
}

const finishQuest = asyncHandler(async (req, res) => {
  const { questId } = req.body
  const playerId = req.id

  const questlog = await Questlog.findOne({ playerId })
  const quest = await Quest.findOne({ _id: questId })
  const player = await Player.findOne({ _id: playerId })

  if (!questlog || !quest || !player) {
    throw ApiError.badRequest('Nie udało się zakończyć zadania')
  }

  const hasQuest = questlog.completedQuests.findIndex(
    (el) => el._id.toString() === questId
  )

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

  const newActiveQuest = questlog.activeQuests.filter(
    (aq) => aq._id.toString() !== questId
  )

  questlog.activeQuests = newActiveQuest
  questlog.completedQuests = [...questlog.completedQuests, { _id: questId }]

  await questlog.save()
  await player.save()

  return res.status(200).json({ message: 'Zakończono zadanie' })
})

// const getPlayersHighscores = async (req, res) => {
//   try {
//     const players = await Player.find().sort({ level: -1 }).limit(10)
//     return res.status(200).json({ data: players })
//   } catch (err) {
//     return res.status(400).json({ message: 'Nie udało się danych' })
//   }
// }

export { getPlayerQuestlog, startQuest, finishQuest }

const Item = require('../models/Item')
const Player = require('../models/Player')
const Questlog = require('../models/Questlog')
const Quest = require('../models/Quest')

// const updateMe = async (req, res) => {
//   try {
//     const email = req.email

//     await Player.updateOne({ email }, { ...req.body })

//     return res.status(200).json({ data: 'User updated' })
//   } catch (err) {
//     console.log(err)
//     return res.status(400).json({ message: 'Nie udalo sie zaktualizowac' })
//   }
// }

const getPlayerQuestlog = async (req, res) => {
  try {
    const playerId = req.id

    const questlog = await Questlog.findOne({ playerId }).populate({
      path: 'activeQuests completedQuests',
      populate: {
        path: 'requiredItems rewardItems',
      },
    })

    console.log('playerID', playerId)
    console.log('questlog', questlog)

    return res.status(200).json({ data: questlog })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie pobrac questow' })
  }
}

const startQuest = async (req, res) => {
  try {
    const { questId } = req.body

    console.log('=================== quetID', req.body)
    const playerId = req.id

    const questlog = await Questlog.findOne({ playerId })

    const hasQuest = [
      ...questlog.activeQuests,
      ...questlog.completedQuests,
    ].findIndex((el) => el._id.toString() === questId)

    if (hasQuest !== -1) {
      return res
        .status(400)
        .json({ message: 'Nie udalo sie dodac questa (jest juz dodany)' })
    }
    // if (questlog.activeQuests.)
    questlog.activeQuests.push({ _id: questId })
    await questlog.save()
    return res.status(200).json({ message: 'Rozpoczęto nowy quest' })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie rozpoczac zadania' })
  }
}

const hasRequiredItems = (inventory, requiredItems) => {
  // Count occurrences of each required item in inventory
  const itemCounts = {}
  for (const item of inventory) {
    if (requiredItems.includes(item)) {
      itemCounts[item] = (itemCounts[item] || 0) + 1
    }
  }

  console.log('=== ITEM COUNTS', itemCounts)
  console.log('==== ITEM inventory', inventory)
  console.log('==== ITEM requiredItems', requiredItems)

  // Check that inventory has enough of each required item
  // requiredItems.filter((i) => i === item).length
  console.log(
    '===== TEST',
    requiredItems.filter((i) => i.toString() === '63e96737ecbb4c981ca98882')
      .length
  )
  for (const itemObj of requiredItems) {
    const item = itemObj.toString()
    console.log('ooooo ITEM', item)
    console.log('ooooo requiredItems', requiredItems)
    console.log('ooooo itemCounts[item]', itemCounts[item])
    console.log(
      'ooooo requiredItems.filter((i) => i.toString() === item).length',
      requiredItems.filter((i) => i.toString() === item).length
    )

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

  // return true
}

const finishQuest = async (req, res) => {
  try {
    const { questId } = req.body

    const playerId = req.id

    const questlog = await Questlog.findOne({ playerId })
    const quest = await Quest.findOne({ _id: questId })
    const player = await Player.findOne({ _id: playerId })

    // console.log('playeer inv', player.inventory.all)
    // console.log('quest.requiredItems', quest.requiredItems)

    const hasQuest = questlog.completedQuests.findIndex(
      (el) => el._id.toString() === questId
    )

    console.log(
      'hasRequiredItems',
      hasRequiredItems(player.inventory.all, quest.requiredItems)
    )

    if (hasQuest !== -1) {
      return res
        .status(400)
        .json({ message: 'Nie udalo sie zakonzcyc questa (jest juz zrobiony)' })
    }

    if (!hasRequiredItems(player.inventory.all, quest.requiredItems)) {
      return res.status(400).json({ message: 'Nie spelniasz wymagan' })
    }

    console.log('BEFORE player.inventory.all', player.inventory.all)

    for (requiredItem of quest.requiredItems) {
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

    const newActiveQuest = questlog.activeQuests.filter(
      (aq) => aq._id.toString() !== questId
    )

    console.log('newActiveQuest', newActiveQuest)

    questlog.activeQuests = newActiveQuest
    questlog.completedQuests = [...questlog.completedQuests, { _id: questId }]

    await questlog.save()
    await player.save()

    return res.status(200).json({ message: 'Zakonczono quest' })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie zakonczyc zadania' })
  }
}

// const getPlayersHighscores = async (req, res) => {
//   try {
//     const players = await Player.find().sort({ level: -1 }).limit(10)
//     return res.status(200).json({ data: players })
//   } catch (err) {
//     return res.status(400).json({ message: 'Nie udało się danych' })
//   }
// }

module.exports = {
  getPlayerQuestlog,
  startQuest,
  finishQuest,
  // getPlayersHighscores,
  // updateMe,
}

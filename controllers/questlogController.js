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
    questlog.activeQuests.push({ _id: questId })
    questlog.save()
    return res.status(200).json({ message: 'Rozpoczęto nowy quest' })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie rozpoczac zadania' })
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
  // getPlayersHighscores,
  // updateMe,
}

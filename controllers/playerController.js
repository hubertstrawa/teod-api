const Item = require('../models/Item')
const Player = require('../models/Player')
const Job = require('../models/Job')
const getLootFromEnemy = require('../utils/getLootFromEnemy')

const updateMe = async (req, res) => {
  try {
    const email = req.email

    const { experienceGained } = req.body

    await Player.updateOne({ email }, { ...req.body })

    return res.status(200).json({ data: 'User updated' })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie zaktualizowac' })
  }
}

const getMe = async (req, res) => {
  try {
    const email = req.email

    const currentUser = await Player.findOne({ email })
    if (!currentUser) {
      return res
        .status(400)
        .json({ message: 'Nie udało się pobrać info o current graczu' })
    }

    return res.status(200).json({ data: currentUser })
  } catch (err) {
    return res
      .status(400)
      .json({ message: 'Nie udało się pobrać info o current graczu' })
  }
}

const getPlayersHighscores = async (req, res) => {
  try {
    const players = await Player.find().sort({ level: -1 }).limit(10)
    return res.status(200).json({ data: players })
  } catch (err) {
    return res.status(400).json({ message: 'Nie udało się danych' })
  }
}

const addAttribute = async (req, res) => {
  try {
    const email = req.email

    const { attributeName } = req.body

    const player = await Player.findOne({ email })

    console.log('req body', req.body)

    if (
      attributeName !== 'strength' &&
      attributeName !== 'intelligence' &&
      attributeName !== 'vitality' &&
      attributeName !== 'accuracy' &&
      attributeName !== 'agility'
    ) {
      return res.status(400).json({ message: 'Nie ma takiego atrybutu' })
    }

    if (attributeName === 'strength') {
      const cost = Math.pow(player.attributes.strength, 2) + player.level * 100
      if (player.money < cost) {
        return res.status(400).json({ message: 'Nie masz wystarczająco złota' })
      }
      player.attributes.strength = player.attributes.strength + 1
      player.money = player.money - cost
    }

    if (attributeName === 'intelligence') {
      const cost = Math.pow(player.attributes.intelligence, 2)
      if (player.money < cost) {
        return res.status(400).json({ message: 'Nie masz wystarczająco złota' })
      }
      player.attributes.intelligence = player.attributes.intelligence + 1
      player.money = player.money - cost
    }

    if (attributeName === 'vitality') {
      const cost = Math.pow(player.attributes.vitality, 2)
      if (player.money < cost) {
        return res.status(400).json({ message: 'Nie masz wystarczająco złota' })
      }
      player.attributes.vitality = player.attributes.vitality + 1
      player.maxHealthPoints = player.maxHealthPoints + 2
      player.money = player.money - cost
    }

    if (attributeName === 'accuracy') {
      const cost = Math.pow(player.attributes.accuracy, 2)
      if (player.money < cost) {
        return res.status(400).json({ message: 'Nie masz wystarczająco złota' })
      }
      player.attributes.accuracy = player.attributes.accuracy + 1
      player.money = player.money - cost
    }

    if (attributeName === 'agility') {
      const cost = Math.pow(player.attributes.agility, 2)
      if (player.money < cost) {
        return res.status(400).json({ message: 'Nie masz wystarczająco złota' })
      }
      player.attributes.agility = player.attributes.agility + 1
      player.money = player.money - cost
    }

    await player.save()

    return res.status(200).json({ data: 'Zwiększono atrybut' })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie dodać atrybutu' })
  }
}

const startJob = async (req, res) => {
  try {
    const playerId = req.id

    const { locationName } = req.body
    const player = await Player.findOne({ _id: playerId })

    if (locationName === 'forgotten-forest') {
      player.activeJob = {
        jobId: 1,
        name: 'Zaginiony las',
        location: 'forgotten-forest',
        possibleLoot: [
          { id: '63e965bbecbb4c981ca98880', chance: 20 },
          { id: '63e965bbecbb4c981ca98881', chance: 20 },
          { id: '64198dc4498996fb93e194b5', chance: 20 },
          { id: '6419915d498996fb93e194b6', chance: 20 },
          { id: '642353e6483b9202619f6095', chance: 20 },
        ],
      }
      console.log('player active', player.activeJob)
    } else {
      return res.status(400).json({ message: 'Nie ma takiej lokacji' })
    }

    await player.save()
    console.log('PLAYER', player.activeJob)
    return res.status(200).json({ message: 'Rozpoczęto akcję' })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie podjac akcji' })
  }
}

const finishJob = async (req, res) => {
  try {
    const playerId = req.id
    const { locationName } = req.body

    const player = await Player.findOne({ _id: playerId })
    // console.log('FINIHSJOB', new Date())

    // console.log('FINIHSJOB', new Date(new Date().toUTCString()).getTime())
    // console.log('FINIHSJOB1111', new Date(player.activeJob.timeEnd).getTime())
    // console.log(
    //   'val 2',
    //   new Date(new Date().toUTCString()).getTime() >=
    //     new Date(player.activeJob.timeEnd).getTime()
    // )

    player.markModified('activeJob')

    if (
      new Date(new Date().toUTCString()).getTime() >=
      new Date(player?.activeJob?.timeEnd).getTime()
    ) {
      const lootedItem = getLootFromEnemy(player.activeJob.possibleLoot)
      player.inventory.all.push(lootedItem.id)
      const item = await Item.findOne({ _id: lootedItem.id })
      player.manaPoints = player.maxManaPoints
      player.healthPoints = player.maxHealthPoints
      player.energy = 100
      player.activeJob = null
      await player.save()
      return res.status(200).json({ message: 'Zakończono akcję!', item })
    }

    return res.status(400).json({ message: 'Nie mozna zakonczyc akcji' })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie zakończyć akcji' })
  }
}

const closeJob = async (req, res) => {
  try {
    const playerId = req.id

    const player = await Player.findOne({ _id: playerId })

    player.markModified('activeJob')

    player.activeJob = null
    await player.save()
    return res.status(200).json({ message: 'Przerwano poszukiwania' })
  } catch (err) {
    console.log(err)
    return res
      .status(400)
      .json({ message: 'Nie udalo sie przerwać poszukiwań' })
  }
}

module.exports = {
  getMe,
  getPlayersHighscores,
  updateMe,
  addAttribute,
  startJob,
  finishJob,
  closeJob,
}

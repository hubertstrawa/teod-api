const Item = require('../models/Item')
const Player = require('../models/Player')

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
      const cost = Math.pow(player.attributes.strength, 2)
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

module.exports = {
  getMe,
  getPlayersHighscores,
  updateMe,
  addAttribute,
}

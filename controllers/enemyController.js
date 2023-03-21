const Item = require('../models/Item')
const Player = require('../models/Player')
const enemyData = require('../utils/enemyData')

const getEnemies = async (req, res) => {
  try {
    return res.status(200).json({ data: enemyData })
  } catch (err) {
    return res.status(400).json({ message: 'Nie udało się pobrać anych' })
  }
}

module.exports = {
  getEnemies,
}

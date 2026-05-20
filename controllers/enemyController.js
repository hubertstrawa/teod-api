import Item from '../models/Item.js'
import Player from '../models/Player.js'
import Enemy from '../models/Enemy.js'

const getEnemies = async (req, res) => {
  try {
    const { location: enemiesLocation } = req.query
    const enemies = await Enemy.find({ location: enemiesLocation })
    return res.status(200).json({ data: enemies })
  } catch (err) {
    return res
      .status(400)
      .json({ message: 'Nie udało się pobrać przeciwników' })
  }
}

const getSingleEnemy = async (req, res) => {
  try {
    const { enemyId } = req.query
    const enemy = await Enemy.findOne({ _id: enemyId })
    return res.status(200).json({ data: enemy })
  } catch (err) {
    return res
      .status(400)
      .json({ message: 'Nie udało się pobrać danych przeciwnika' })
  }
}

export { getEnemies, getSingleEnemy }

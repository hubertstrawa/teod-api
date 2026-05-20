import Enemy from '../models/Enemy.js'
import asyncHandler from '../src/shared/http/asyncHandler.js'

const getEnemies = asyncHandler(async (req, res) => {
  const { location: enemiesLocation } = req.query
  const enemies = await Enemy.find({ location: enemiesLocation })
  return res.status(200).json({ data: enemies })
})

const getSingleEnemy = asyncHandler(async (req, res) => {
  const { enemyId } = req.query
  const enemy = await Enemy.findOne({ _id: enemyId })
  return res.status(200).json({ data: enemy })
})

export { getEnemies, getSingleEnemy }

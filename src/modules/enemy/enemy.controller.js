import asyncHandler from '../../shared/http/asyncHandler.js'
import enemyService from './enemy.service.js'

export const createEnemyController = (service = enemyService) => {
  const getEnemies = asyncHandler(async (req, res) => {
    const response = await service.getEnemies({ location: req.query.location })
    return res.status(200).json(response)
  })

  const getSingleEnemy = asyncHandler(async (req, res) => {
    const response = await service.getSingleEnemy({ enemyId: req.query.enemyId })
    return res.status(200).json(response)
  })

  return { getEnemies, getSingleEnemy }
}

const enemyController = createEnemyController()
export const { getEnemies, getSingleEnemy } = enemyController
export default enemyController

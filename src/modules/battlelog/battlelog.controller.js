import asyncHandler from '../../shared/http/asyncHandler.js'
import battlelogService from './battlelog.service.js'

export const createBattlelogController = (service = battlelogService) => {
  const getBattlelog = asyncHandler(async (req, res) => {
    const response = await service.getBattlelog({ playerId: req.id })
    return res.status(200).json(response)
  })

  const getFullBattlelog = asyncHandler(async (req, res) => {
    const response = await service.getFullBattlelog({ playerId: req.id })
    return res.status(200).json(response)
  })

  const startBattle = asyncHandler(async (req, res) => {
    const response = await service.startBattle({
      playerId: req.id,
      enemyId: req.body.enemyId,
    })

    return res.status(200).json(response)
  })

  const attackEnemy = asyncHandler(async (req, res) => {
    const response = await service.attackEnemy({
      playerId: req.id,
      spell: req.body.spell,
    })

    return res.status(200).json(response)
  })

  const getEnemyPlayerData = asyncHandler(async (req, res) => {
    const response = await service.getEnemyPlayerData({ playerId: req.id })
    return res.status(200).json(response)
  })

  return {
    getBattlelog,
    getFullBattlelog,
    startBattle,
    attackEnemy,
    getEnemyPlayerData,
  }
}

const battlelogController = createBattlelogController()
export const {
  getBattlelog,
  getFullBattlelog,
  startBattle,
  attackEnemy,
  getEnemyPlayerData,
} = battlelogController

export default battlelogController

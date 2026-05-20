import Item from '../../../models/Item.js'
import Player from '../../../models/Player.js'
import Battlelog from '../../../models/Battlelog.js'
import Enemy from '../../../models/Enemy.js'

export const createBattlelogRepository = ({
  itemModel = Item,
  playerModel = Player,
  battlelogModel = Battlelog,
  enemyModel = Enemy,
} = {}) => {
  const findBattlelogByPlayerId = (playerId) => battlelogModel.findOne({ playerId })

  const findPlayerWithInventoryById = (playerId) =>
    playerModel.findOne({ _id: playerId }).populate({
      path: 'inventory',
      populate: {
        path: 'all eq.amulet eq.helmet eq.bag eq.weapon eq.armor eq.shield eq.belt eq.boots',
      },
    })

  const findPlayerById = (playerId) => playerModel.findOne({ _id: playerId })

  const findEnemyById = (enemyId) => enemyModel.findOne({ _id: enemyId })

  const findItemById = (itemId) => itemModel.findOne({ _id: itemId })

  const findBattlelogWithEnemyPvpByPlayerId = (playerId) =>
    battlelogModel.findOne({ playerId }).populate({
      path: 'pvp.pvpEnemyPlayerName',
      select: '-password -email -friends -notifications',
    })

  const findPlayerSanitizedById = (playerId) =>
    playerModel
      .findOne({ _id: playerId })
      .select('-password -email -friends -notifications')

  const saveBattlelog = (battlelog) => battlelog.save()
  const savePlayer = (player) => player.save()

  return {
    findBattlelogByPlayerId,
    findPlayerWithInventoryById,
    findPlayerById,
    findEnemyById,
    findItemById,
    findBattlelogWithEnemyPvpByPlayerId,
    findPlayerSanitizedById,
    saveBattlelog,
    savePlayer,
  }
}

const battlelogRepository = createBattlelogRepository()
export default battlelogRepository

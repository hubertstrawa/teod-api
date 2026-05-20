import Item from '../../../models/Item.js'
import Player from '../../../models/Player.js'

export const createInventoryRepository = ({
  itemModel = Item,
  playerModel = Player,
} = {}) => {
  const findPlayerById = (playerId) => playerModel.findOne({ _id: playerId })

  const findPlayerWithInventoryById = (playerId) =>
    playerModel.findOne({ _id: playerId }).populate({
      path: 'inventory',
      populate: {
        path: 'all eq.amulet eq.helmet eq.bag eq.weapon eq.armor eq.shield eq.ring eq.belt eq.boots',
      },
    })

  const findItemById = (itemId) => itemModel.findOne({ _id: itemId })
  const findAllItems = () => itemModel.find()
  const savePlayer = (player) => player.save()

  return {
    findPlayerById,
    findPlayerWithInventoryById,
    findItemById,
    findAllItems,
    savePlayer,
  }
}

const inventoryRepository = createInventoryRepository()
export default inventoryRepository

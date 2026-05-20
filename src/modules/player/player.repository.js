import Player from '../../../models/Player.js'
import Item from '../../../models/Item.js'

export const createPlayerRepository = ({
  playerModel = Player,
  itemModel = Item,
} = {}) => {
  const updateByEmail = (email, updatePayload) =>
    playerModel.updateOne({ email }, updatePayload)

  const findMeByEmail = (email) =>
    playerModel
      .findOne({ email })
      .select('-password -email')
      .populate({ path: 'friends.list', select: 'playerName avatar level' })

  const findPlayersHighscores = () =>
    playerModel
      .find()
      .sort({ level: -1 })
      .limit(10)
      .select('-password -email')

  const findSingleByPlayerName = (playerName) =>
    playerModel
      .findOne({ playerName })
      .select('-password -email -inventory.all -notifications -friends')
      .populate({
        path: 'inventory',
        populate: {
          path: 'eq.amulet eq.helmet eq.bag eq.weapon eq.armor eq.shield eq.ring eq.belt eq.boots',
        },
      })

  const findPlayerByEmailSanitized = (email) =>
    playerModel.findOne({ email }).select('-password -email')

  const findPlayerByEmail = (email) => playerModel.findOne({ email })

  const findPlayerById = (playerId) => playerModel.findOne({ _id: playerId })

  const findFriendsContextByEmail = (email) =>
    playerModel.findOne({ email }).select('_id friends playerName notifications')

  const findFriendsContextByPlayerName = (playerName) =>
    playerModel.findOne({ playerName }).select('_id friends playerName notifications')

  const findFriendsContextById = (playerId) =>
    playerModel.findOne({ _id: playerId }).select('_id friends playerName notifications')

  const findItemById = (itemId) => itemModel.findOne({ _id: itemId })

  const savePlayer = (player) => player.save()

  return {
    updateByEmail,
    findMeByEmail,
    findPlayersHighscores,
    findSingleByPlayerName,
    findPlayerByEmailSanitized,
    findPlayerByEmail,
    findPlayerById,
    findFriendsContextByEmail,
    findFriendsContextByPlayerName,
    findFriendsContextById,
    findItemById,
    savePlayer,
  }
}

const playerRepository = createPlayerRepository()
export default playerRepository

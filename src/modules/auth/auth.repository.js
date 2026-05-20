import Player from '../../../models/Player.js'
import Tasklog from '../../../models/Tasklog.js'
import Battlelog from '../../../models/Battlelog.js'
import Questlog from '../../../models/Questlog.js'

export const createAuthRepository = ({
  playerModel = Player,
  tasklogModel = Tasklog,
  battlelogModel = Battlelog,
  questlogModel = Questlog,
} = {}) => {
  const findByEmailOrPlayerName = ({ email, playerName }) =>
    playerModel.findOne({
      $or: [{ email }, { playerName }],
    })

  const findByEmail = (email) => playerModel.findOne({ email })

  const createPlayer = async (playerData, session) => {
    const [player] = await playerModel.create([playerData], { session })
    return player
  }

  const createSignupLogs = (playerId, session) =>
    Promise.all([
      questlogModel.create([{ playerId }], { session }),
      battlelogModel.create([{ playerId }], { session }),
      tasklogModel.create([{ playerId }], { session }),
    ])

  const savePlayer = (player, session) => player.save({ session })

  return {
    findByEmailOrPlayerName,
    findByEmail,
    createPlayer,
    createSignupLogs,
    savePlayer,
  }
}

const authRepository = createAuthRepository()
export default authRepository

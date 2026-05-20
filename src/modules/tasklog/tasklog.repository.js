import Tasklog from '../../../models/Tasklog.js'
import Battlelog from '../../../models/Battlelog.js'
import Task from '../../../models/Task.js'
import Player from '../../../models/Player.js'

export const createTasklogRepository = ({
  tasklogModel = Tasklog,
  battlelogModel = Battlelog,
  taskModel = Task,
  playerModel = Player,
} = {}) => {
  const findTasksByLocation = (location) => taskModel.find({ location })
  const findTasklogByPlayerId = (playerId) => tasklogModel.findOne({ playerId })
  const findTaskById = (taskId) => taskModel.findOne({ _id: taskId })
  const findPlayerById = (playerId) => playerModel.findOne({ _id: playerId })
  const findBattlelogByPlayerId = (playerId) => battlelogModel.findOne({ playerId })
  const saveTasklog = (tasklog) => tasklog.save()
  const saveBattlelog = (battlelog) => battlelog.save()

  return {
    findTasksByLocation,
    findTasklogByPlayerId,
    findTaskById,
    findPlayerById,
    findBattlelogByPlayerId,
    saveTasklog,
    saveBattlelog,
  }
}

const tasklogRepository = createTasklogRepository()
export default tasklogRepository

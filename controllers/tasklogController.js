import Tasklog from '../models/Tasklog.js'
import Battlelog from '../models/Battlelog.js'
import Task from '../models/Task.js'
import Player from '../models/Player.js'
import ApiError from '../src/shared/errors/ApiError.js'
import asyncHandler from '../src/shared/http/asyncHandler.js'

const getTasks = asyncHandler(async (req, res) => {
  // Location currently hardcoded
  const tasks = await Task.find({ location: 'forgotten-forest' })
  return res.status(200).json({ data: tasks })
})

const getPlayerTasklog = asyncHandler(async (req, res) => {
  const playerId = req.id
  const tasklog = await Tasklog.findOne({ playerId })
  return res.status(200).json({ data: tasklog })
})

const startTask = asyncHandler(async (req, res) => {
  const { taskId } = req.body
  const playerId = req.id

  const task = await Task.findOne({ _id: taskId })
  const player = await Player.findOne({ _id: playerId })
  const tasklog = await Tasklog.findOne({ playerId })
  const battlelog = await Battlelog.findOne({ playerId })

  if (!task || !player || !tasklog || !battlelog) {
    throw ApiError.badRequest('Nie udalo sie rozpoczac taska')
  }

  tasklog.markModified('activeTask')

  if (player.level < task.minLevel) {
    throw ApiError.badRequest('Masz zbyt mały level')
  }

  tasklog.activeTask = {
    countStart: battlelog?.killedMonsters?.[task.enemyId] || 0,
    countEnd: battlelog?.killedMonsters?.[task.enemyId] + 100 || 100,
    idTask: task._id,
    name: task.name,
    bossId: task.bossId,
    enemyId: task.enemyId,
    taskPointsAdd: task.taskPointsAdd,
  }

  await tasklog.save()
  return res
    .status(200)
    .json({ message: 'Rozpoczęto nowy task', activeTask: tasklog.activeTask })
})

const finishTask = asyncHandler(async (req, res) => {
  const playerId = req.id
  const { taskId } = req.body
  const tasklog = await Tasklog.findOne({ playerId })
  const task = await Task.findOne({ _id: taskId })
  const battlelog = await Battlelog.findOne({ playerId })

  if (!taskId || !tasklog || !task || !battlelog || !tasklog.activeTask?.idTask) {
    throw ApiError.badRequest('Nie udalo sie zakończyć taska (1)')
  }

  if (
    taskId !== tasklog.activeTask.idTask.toString() ||
    battlelog.killedMonsters[task.enemyId] < tasklog.activeTask.countEnd
  ) {
    throw ApiError.badRequest('Nie udalo sie zakończyć taska (1)')
  }

  tasklog.markModified('activeTask')

  const bossId = tasklog.activeTask.bossId
  tasklog.taskPoints = tasklog.taskPoints + tasklog.activeTask.taskPointsAdd
  battlelog.availableBoss = bossId
  tasklog.activeTask = {}

  await battlelog.save()
  await tasklog.save()
  return res.status(200).json({ message: 'Zakończono task', availableBoss: bossId })
})

const closeTask = asyncHandler(async (req, res) => {
  const playerId = req.id
  const tasklog = await Tasklog.findOne({ playerId })

  if (!tasklog) {
    throw ApiError.badRequest('Nie udalo sie przerwać taska')
  }

  tasklog.markModified('activeTask')
  tasklog.activeTask = {}

  await tasklog.save()
  return res.status(200).json({ message: 'Przerwano task' })
})

// const getPlayersHighscores = async (req, res) => {
//   try {
//     const players = await Player.find().sort({ level: -1 }).limit(10)
//     return res.status(200).json({ data: players })
//   } catch (err) {
//     return res.status(400).json({ message: 'Nie udało się danych' })
//   }
// }

export { getTasks, getPlayerTasklog, startTask, finishTask, closeTask }

// module.exports = {
//   getTasks,
//   getPlayerTasklog,
//   startTask,
//   finishTask,
//   closeTask,
//   // getPlayersHighscores,
//   // updateMe,
// }

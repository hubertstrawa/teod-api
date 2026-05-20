import Tasklog from '../models/Tasklog.js'
import Battlelog from '../models/Battlelog.js'
import Task from '../models/Task.js'
import Player from '../models/Player.js'

const getTasks = async (req, res) => {
  try {
    const playerId = req.id

    // Location currently hardcoded
    const tasks = await Task.find({ location: 'forgotten-forest' })

    return res.status(200).json({ data: tasks })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie pobrac taskow' })
  }
}

const getPlayerTasklog = async (req, res) => {
  try {
    const playerId = req.id

    const tasklog = await Tasklog.findOne({ playerId })

    return res.status(200).json({ data: tasklog })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie pobrac tasklog' })
  }
}

const startTask = async (req, res) => {
  try {
    const { taskId } = req.body

    const playerId = req.id

    const task = await Task.findOne({ _id: taskId })
    const player = await Player.findOne({ _id: playerId })

    const tasklog = await Tasklog.findOne({ playerId })
    tasklog.markModified('activeTask')

    const battlelog = await Battlelog.findOne({ playerId })

    if (player.level < task.minLevel) {
      return res.status(400).json({ message: 'Masz zbyt mały level' })
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
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie rozpoczac taska' })
  }
}

const finishTask = async (req, res) => {
  try {
    const playerId = req.id

    const { taskId } = req.body
    const tasklog = await Tasklog.findOne({ playerId })
    const task = await Task.findOne({ _id: taskId })
    const battlelog = await Battlelog.findOne({ playerId })

    if (
      !taskId ||
      taskId !== tasklog.activeTask.idTask.toString() ||
      battlelog.killedMonsters[task.enemyId] < tasklog.activeTask.countEnd
    ) {
      return res
        .status(400)
        .json({ message: 'Nie udalo sie zakończyć taska (1)' })
    }

    // if (battlelog.killedMonsters[task.enemyId] < tasklog.activeTask.countEnd) {
    //   return res.status(400).json({ message: 'Nie udalo sie zakończyć taska' })
    // }

    tasklog.markModified('activeTask')

    const bossId = tasklog.activeTask.bossId

    tasklog.taskPoints = tasklog.taskPoints + tasklog.activeTask.taskPointsAdd
    battlelog.availableBoss = bossId
    tasklog.activeTask = {}

    await battlelog.save()
    await tasklog.save()
    return res
      .status(200)
      .json({ message: 'Zakończono task', availableBoss: bossId })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie zakończyć taska' })
  }
}

const closeTask = async (req, res) => {
  try {
    const playerId = req.id

    const tasklog = await Tasklog.findOne({ playerId })
    tasklog.markModified('activeTask')
    tasklog.activeTask = {}

    await tasklog.save()
    return res.status(200).json({ message: 'Przerwano task' })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie przerwać taska' })
  }
}

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

import ApiError from '../../shared/errors/ApiError.js'
import tasklogRepository from './tasklog.repository.js'

const DEFAULT_TASK_LOCATION = 'forgotten-forest'

const getKilledMonsterCount = (battlelog, enemyId) => {
  if (!battlelog?.killedMonsters || !enemyId) {
    return 0
  }

  return battlelog.killedMonsters.get(enemyId.toString()) ?? 0
}

export const createTasklogService = ({ repository = tasklogRepository } = {}) => {
  const getTasks = async () => {
    const tasks = await repository.findTasksByLocation(DEFAULT_TASK_LOCATION)
    return { data: tasks }
  }

  const getPlayerTasklog = async ({ playerId }) => {
    const tasklog = await repository.findTasklogByPlayerId(playerId)
    return { data: tasklog }
  }

  const startTask = async ({ playerId, taskId }) => {
    const [task, player, tasklog, battlelog] = await Promise.all([
      repository.findTaskById(taskId),
      repository.findPlayerById(playerId),
      repository.findTasklogByPlayerId(playerId),
      repository.findBattlelogByPlayerId(playerId),
    ])

    if (!task || !player || !tasklog || !battlelog) {
      throw ApiError.badRequest('Nie udalo sie rozpoczac taska')
    }

    if (player.level < task.minLevel) {
      throw ApiError.badRequest('Masz zbyt mały level')
    }

    if (tasklog.activeTask?.status === 'active') {
      throw ApiError.badRequest('Najpierw zakończ lub przerwij aktywny task')
    }

    if (battlelog.current?.status === 'in_progress' && !battlelog.current?.isOver) {
      throw ApiError.badRequest('Nie można rozpocząć taska w trakcie aktywnej walki')
    }

    const countStart = getKilledMonsterCount(battlelog, task.enemyId)

    tasklog.activeTask = {
      status: 'active',
      countStart,
      countEnd: countStart + 100,
      idTask: task._id,
      name: task.name,
      bossId: task.bossId,
      enemyId: task.enemyId,
      taskPointsAdd: task.taskPointsAdd,
    }

    await repository.saveTasklog(tasklog)
    return { message: 'Rozpoczęto nowy task', activeTask: tasklog.activeTask }
  }

  const finishTask = async ({ playerId, taskId }) => {
    const [tasklog, task, battlelog] = await Promise.all([
      repository.findTasklogByPlayerId(playerId),
      repository.findTaskById(taskId),
      repository.findBattlelogByPlayerId(playerId),
    ])

    if (
      !taskId ||
      !tasklog ||
      !task ||
      !battlelog ||
      !tasklog.activeTask ||
      tasklog.activeTask.status !== 'active'
    ) {
      throw ApiError.badRequest('Nie udalo sie zakończyć taska (1)')
    }

    const killedCount = getKilledMonsterCount(battlelog, task.enemyId)

    if (
      taskId !== tasklog.activeTask.idTask.toString() ||
      killedCount < tasklog.activeTask.countEnd
    ) {
      throw ApiError.badRequest('Nie udalo sie zakończyć taska (1)')
    }

    const bossId = tasklog.activeTask.bossId
    tasklog.taskPoints = tasklog.taskPoints + tasklog.activeTask.taskPointsAdd
    battlelog.availableBoss = bossId
    tasklog.activeTask = null

    await repository.saveBattlelog(battlelog)
    await repository.saveTasklog(tasklog)
    return { message: 'Zakończono task', availableBoss: bossId }
  }

  const closeTask = async ({ playerId }) => {
    const tasklog = await repository.findTasklogByPlayerId(playerId)

    if (!tasklog) {
      throw ApiError.badRequest('Nie udalo sie przerwać taska')
    }

    if (!tasklog.activeTask || tasklog.activeTask.status !== 'active') {
      throw ApiError.badRequest('Nie masz aktywnego taska do przerwania')
    }

    tasklog.activeTask = null

    await repository.saveTasklog(tasklog)
    return { message: 'Przerwano task' }
  }

  return {
    getTasks,
    getPlayerTasklog,
    startTask,
    finishTask,
    closeTask,
  }
}

const tasklogService = createTasklogService()
export default tasklogService

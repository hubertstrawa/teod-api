import asyncHandler from '../../shared/http/asyncHandler.js'
import tasklogService from './tasklog.service.js'

export const createTasklogController = (service = tasklogService) => {
  const getTasks = asyncHandler(async (_req, res) => {
    const response = await service.getTasks()
    return res.status(200).json(response)
  })

  const getPlayerTasklog = asyncHandler(async (req, res) => {
    const response = await service.getPlayerTasklog({ playerId: req.id })
    return res.status(200).json(response)
  })

  const startTask = asyncHandler(async (req, res) => {
    const response = await service.startTask({
      playerId: req.id,
      taskId: req.body.taskId,
    })

    return res.status(200).json(response)
  })

  const finishTask = asyncHandler(async (req, res) => {
    const response = await service.finishTask({
      playerId: req.id,
      taskId: req.body.taskId,
    })

    return res.status(200).json(response)
  })

  const closeTask = asyncHandler(async (req, res) => {
    const response = await service.closeTask({ playerId: req.id })
    return res.status(200).json(response)
  })

  return { getTasks, getPlayerTasklog, startTask, finishTask, closeTask }
}

const tasklogController = createTasklogController()
export const { getTasks, getPlayerTasklog, startTask, finishTask, closeTask } =
  tasklogController

export default tasklogController

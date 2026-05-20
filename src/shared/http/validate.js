import { z } from 'zod'
import ApiError from '../errors/ApiError.js'

const emptyObjectSchema = z.object({}).strict()

const formatIssues = (issues) =>
  issues.map((issue) => ({
    path: issue.path.join('.') || 'root',
    message: issue.message,
  }))

const validate = ({ body, query, params } = {}) =>
  async (req, _res, next) => {
    try {
      req.body = await (body ?? emptyObjectSchema).parseAsync(req.body ?? {})
      req.query = await (query ?? emptyObjectSchema).parseAsync(req.query ?? {})
      req.params = await (params ?? emptyObjectSchema).parseAsync(req.params ?? {})
      return next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(
          ApiError.badRequest(
            'Nieprawidlowe dane wejsciowe',
            formatIssues(error.issues),
            'VALIDATION_ERROR'
          )
        )
      }

      return next(error)
    }
  }

export default validate

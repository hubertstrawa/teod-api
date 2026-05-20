import ApiError from '../errors/ApiError.js'
import logger from '../logger/logger.js'

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error)
  }

  const statusCode = error instanceof ApiError ? error.statusCode : 500
  const code =
    error instanceof ApiError ? error.code : 'INTERNAL_SERVER_ERROR'
  const message =
    error instanceof ApiError
      ? error.message
      : 'Wystapil nieoczekiwany blad serwera'

  logger.error('Request failed', {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    code,
    message,
    details: error.details,
    stack: error.stack,
  })

  return res.status(statusCode).json({
    error: {
      code,
      message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    },
  })
}

export default errorHandler

class ApiError extends Error {
  constructor({
    statusCode = 500,
    code = 'INTERNAL_SERVER_ERROR',
    message = 'Wystapil nieoczekiwany blad',
    details,
  }) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code

    if (details !== undefined) {
      this.details = details
    }

    Error.captureStackTrace?.(this, ApiError)
  }

  static badRequest(message = 'Bad request', details, code = 'BAD_REQUEST') {
    return new ApiError({ statusCode: 400, code, message, details })
  }

  static unauthorized(message = 'Unauthorized', details, code = 'UNAUTHORIZED') {
    return new ApiError({ statusCode: 401, code, message, details })
  }

  static forbidden(message = 'Forbidden', details, code = 'FORBIDDEN') {
    return new ApiError({ statusCode: 403, code, message, details })
  }

  static notFound(message = 'Not found', details, code = 'NOT_FOUND') {
    return new ApiError({ statusCode: 404, code, message, details })
  }
}

export default ApiError

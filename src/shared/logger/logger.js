const serializeMeta = (meta) => {
  if (!meta) {
    return ''
  }

  try {
    return ` ${JSON.stringify(meta)}`
  } catch (error) {
    return ' {"meta":"[unserializable]"}'
  }
}

const buildMessage = (level, message, meta) =>
  `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}${serializeMeta(meta)}`

const logger = {
  info: (message, meta) => {
    console.info(buildMessage('info', message, meta))
  },
  warn: (message, meta) => {
    console.warn(buildMessage('warn', message, meta))
  },
  error: (message, meta) => {
    console.error(buildMessage('error', message, meta))
  },
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(buildMessage('debug', message, meta))
    }
  },
}

export default logger

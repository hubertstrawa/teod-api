import startServer from './bootstrap/startServer.js'

let app, server, io

try {
  ({ app, server, io } = await startServer())
} catch (error) {
  console.error('Failed to start server:', error)
  process.exit(1)
}

export { app, server, io }

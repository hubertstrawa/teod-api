import startServer from './bootstrap/startServer.js'

let app
let server
let io

startServer()
  .then((instances) => {
    app = instances.app
    server = instances.server
    io = instances.io
  })
  .catch((error) => {
    console.error('Failed to start server:', error)
    process.exit(1)
  })

export { app, server, io }

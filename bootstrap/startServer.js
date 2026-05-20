import dotenv from 'dotenv'
import http from 'http'
import connectDB from '../config/dbConnect.js'
import createApp from '../app/createApp.js'
import createSocketServer from '../realtime/createSocketServer.js'
import registerPlayerRealtimeHandlers from '../src/realtime/handlers/playerRealtimeHandlers.js'

dotenv.config()

const DEFAULT_PORT = 3003

const startServer = async (port = DEFAULT_PORT) => {
  await connectDB()

  const app = createApp()
  const server = http.createServer(app)
  const io = createSocketServer(server)
  registerPlayerRealtimeHandlers(io)
  app.set('io', io)

  await new Promise((resolve, reject) => {
    server.listen(port, resolve)
    server.on('error', reject)
  })

  console.log(`Server is listening on port ${port}`)

  return { app, server, io }
}

export default startServer

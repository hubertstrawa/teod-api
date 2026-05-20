import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import mongoSanitize from 'express-mongo-sanitize'
import cookieParser from 'cookie-parser'
import connectDB from './config/dbConnect.js'
import jwt from 'jsonwebtoken'
import authRoutes from './routes/authRoutes.js'
import playerRoutes from './routes/playerRoutes.js'
import inventoryRoutes from './routes/inventoryRoutes.js'
import questLogRoutes from './routes/questlogRoutes.js'
import tasklogRoutes from './routes/tasklogRoutes.js'
import battlelogRoutes from './routes/battlelogRoutes.js'
import enemyRoutes from './routes/enemyRoutes.js'
import http from 'http'
import { Server as SocketServer } from 'socket.io'
import { getSocketIdForPlayer } from './controllers/playerController.js'
import Battlelog from './models/Battlelog.js'
import mongoose from 'mongoose'

dotenv.config()
const app = express()
const server = http.createServer(app)
connectDB()

//Middleware
const corsOptions = {
  credentials: true,
  origin: [
    'https://teod.netlify.app',
    'http://localhost:3332',
    'https://teod.pl',
  ],
}
app.use(cors(corsOptions))
app.use(mongoSanitize())
app.use(cookieParser())
app.use(express.json())

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/player', playerRoutes)
app.use('/api/v1/inventory', inventoryRoutes)
app.use('/api/v1/questlog', questLogRoutes)
app.use('/api/v1/tasklog', tasklogRoutes)
app.use('/api/v1/battlelog', battlelogRoutes)
app.use('/api/v1/enemy', enemyRoutes)

const io = new SocketServer(server, {
  cors: {
    origin: ['http://localhost:3332', 'https://teod.pl'],
  },
})

io.use((socket, next) => {
  const token = socket.handshake.auth.token

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return next(new Error('Unauthorized [socket.io]'))

    socket.player = {
      email: decoded.UserInfo.email,
      id: decoded.UserInfo.id,
      playerName: decoded.UserInfo.playerName,
    }
    next()
  })
})

io.on('connection', (socket) => {
  console.log('New user connected')

  io.emit('joined_game', `${socket.player.playerName} dołączył/a do gry`)

  const onlineSocketsData = Array.from(io.sockets.sockets.values()).map(
    (socket) => ({
      id: socket.id,
      playerName: socket.player.playerName,
    })
  )

  io.emit('online_players', {
    connectedSockets: onlineSocketsData,
    onlineCount: io.sockets.sockets.size,
  })

  // Handle incoming events
  socket.on('message', (data) => {
    io.emit('response', data)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected')
    const onlineSocketsData = Array.from(io.sockets.sockets.values()).map(
      (socket) => ({
        id: socket.id,
        playerName: socket.player.playerName,
      })
    )

    // Emit updated online players count
    io.emit('online_players', {
      connectedSockets: onlineSocketsData,
      onlineCount: io.sockets.sockets.size,
    })
    io.emit('joined_game', `${socket.player.playerName} opuścił/a z gry`)
  })
})

server.listen(3003, () => {
  console.log('Server is listening on port 3003')
})

export { io }

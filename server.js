require('dotenv').config()
const express = require('express')
const cors = require('cors')
const url = require('url')
const mongoSanitize = require('express-mongo-sanitize')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/dbConnect')
const jwt = require('jsonwebtoken')
const authRoutes = require('./routes/authRoutes')
const playerRoutes = require('./routes/playerRoutes')
const inventoryRoutes = require('./routes/inventoryRoutes')
const questLogRoutes = require('./routes/questlogRoutes')
const battlelogRoutes = require('./routes/battlelogRoutes')
const http = require('http')
const socketio = require('socket.io')

const enemyRoutes = require('./routes/enemyRoutes')

// db.items.insertOne({
//   _id: ObjectId("641991d3498996fb93e194b7"),
//   name: 'Przeklęte wiewiórki',
//   description: 'Przynieś skradziony pojemnik na wodę.',
//   requiredItems: '6419915d498996fb93e194b6',
//   rewardMoney: 500
// })

// const { Server } = require('socket.io')
const app = express()
const server = http.createServer(app)

// const socketio = require('socket.io')
// const server = http.createServer(app)
// const io = socketio(server)

const corsOptions = {
  credentials: true,
  origin: [
    'https://teod.netlify.app',
    'http://localhost:3332',
    'https://teod.pl',
  ],
  optionsSuccessStatus: 200, // For legacy browser support
}

app.use(cors(corsOptions))
app.use(mongoSanitize())
app.use(cookieParser())
app.use(express.json())

connectDB()

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/player', playerRoutes)
app.use('/api/v1/inventory', inventoryRoutes)
app.use('/api/v1/questlog', questLogRoutes)
app.use('/api/v1/battlelog', battlelogRoutes)
app.use('/api/v1/enemy', enemyRoutes)

// const io = new Server(3004, {
//   cors: {
//     origin: ['http://localhost:3332'],
//   },
// })

// app.get('*', function (req, res) {
//   console.log('HIT 404')
//   res.status(404).json({ message: '404' })
// })
const io = socketio(server, {
  cors: {
    origin: ['http://localhost:3332', 'https://teod.pl'],
  },
})

io.use((socket, next) => {
  const token = socket.handshake.auth.token
  // verify the JWT and extract user information
  // ...
  console.log('token', token)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return console.log('WRONG DECODED SOCKET JWT!', err)
    console.log('DECODED', decoded)
    socket.player = {
      email: decoded.UserInfo.email,
      id: decoded.UserInfo.id,
      playerName: decoded.UserInfo.playerName,
    }
    next()
  })

  //  // store user info in socket object
  // next()
})

io.on('connection', (socket) => {
  console.log('New user connected')

  io.emit('joined_game', `${socket.player.playerName} dołączył/a do gry`)

  // const connectedSockets = Object.keys(io.sockets.sockets).map((socketId) => {
  //   return io.sockets.sockets[socketId]
  // })

  // console.log('connectedSockets', connectedSockets)

  // console.log('onlinee', )
  // io.sockets.sockets.forEach((el) =>
  //   console.log('XXXXXXXXXXX EL', el.handshake)
  // )

  Object.keys(io.sockets.sockets).forEach((socketId) => {
    const socket = io.sockets.sockets[socketId]
    console.log('socket', socket)
  })

  io.emit('online_players', io.engine.clientsCount)

  // Handle incoming events
  socket.on('message', (data) => {
    console.log('Received message:', data)

    // Broadcast the message to all connected clients
    io.emit('response', data)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected')

    // Emit updated online players count
    io.emit('online_players', io.engine.clientsCount)
    io.emit('joined_game', `${socket.player.playerName} opuścił/a z gry`)
  })
})

server.listen(3003, () => {
  console.log('Server is listening on port 3003')
})
// const port = 3003
// app.listen(port, () => {
//   console.log('server is running')
// })

// const io = require('socket.io')(3003, {
//   cors: {
//     origin: ['http://localhost:3332'],
//   },
// })

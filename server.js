require('dotenv').config()
const express = require('express')
const cors = require('cors')
const url = require('url')
const mongoSanitize = require('express-mongo-sanitize')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/dbConnect')
const authRoutes = require('./routes/authRoutes')
const playerRoutes = require('./routes/playerRoutes')
const inventoryRoutes = require('./routes/inventoryRoutes')
const questLogRoutes = require('./routes/questlogRoutes')
const { Server } = require('socket.io')
const app = express()

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
app.use(bodyParser.json())

connectDB()

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/player', playerRoutes)
app.use('/api/v1/inventory', inventoryRoutes)
app.use('/api/v1/questlog', questLogRoutes)

const io = new Server(3004, {
  cors: {
    origin: ['http://localhost:3332'],
  },
})

app.get('*', function (req, res) {
  console.log('HIT 404')
  res.status(404).json({ message: '404' })
})

const port = 3003
app.listen(port, () => {
  console.log('server is running')
})

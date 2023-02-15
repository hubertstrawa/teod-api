require('dotenv').config()
const express = require('express')
const cors = require('cors')
const url = require('url')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/dbConnect')
const player = require('./routes/player')
const authRoutes = require('./routes/authRoutes')
const bcrypt = require('bcrypt')
const pool = require('./db2')
const db = require('./db')
const jwt = require('jsonwebtoken')
const verifyJWT = require('./middleware/verifyJWT')
const Player = require('./models/Player')
const Item = require('./models/Item')

const app = express()

// let sql

// const sql = `CREATE TABLE quote(ID INTEGER PRIMARY KEY, movie, quote, character)`
// db.run(sql)

const corsOptions = {
  credentials: true,
  origin: ['http://localhost:3000', 'http://localhost:3332'],
  optionsSuccessStatus: 200, // For legacy browser support
}

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(bodyParser.json())

connectDB()

app.post('/test', async (req, res) => {
  try {
    console.log('reqbody', req.body)

    const { email, playerName, password, inventory } = req.body

    if (!playerName || !password || !email) {
      return res.json({
        status: 400,
        success: false,
        err: 'Login email hasło nie mogą być puste',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const playerObject = {
      playerName,
      password: hashedPassword,
      email,
      inventory,
    }

    const player = await Player.create(playerObject)
    player.password = undefined

    return res.status(200).json({ data: player })
  } catch (err) {
    console.error(err)
    return res.json({
      status: 400,
      success: false,
    })
  }
})

app.get('/populatetest', async (req, res) => {
  try {
    const testt = await Player.find().populate({
      path: 'inventory',
      populate: {
        path: 'allItems bag weapon armor helmet',
      },
    })
    return res.status(200).json({ data: testt })
  } catch (err) {
    console.error(err)
    return res.json({
      status: 400,
      success: false,
    })
  }
})

app.use('/api/v1/players', player)
app.use('/api/v1/auth', authRoutes)

app.get('*', function (req, res) {
  console.log('test')
  res.status(404).json({ message: '404' })
})

const port = 3003
app.listen(port, () => {
  console.log('server is running')
})

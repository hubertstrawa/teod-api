import express from 'express'
import cors from 'cors'
import mongoSanitize from 'express-mongo-sanitize'
import cookieParser from 'cookie-parser'
import authRoutes from '../routes/authRoutes.js'
import playerRoutes from '../routes/playerRoutes.js'
import inventoryRoutes from '../routes/inventoryRoutes.js'
import questLogRoutes from '../routes/questlogRoutes.js'
import tasklogRoutes from '../routes/tasklogRoutes.js'
import battlelogRoutes from '../routes/battlelogRoutes.js'
import enemyRoutes from '../routes/enemyRoutes.js'

const corsOptions = {
  credentials: true,
  origin: [
    'https://teod.netlify.app',
    'http://localhost:3332',
    'https://teod.pl',
  ],
}

const createApp = () => {
  const app = express()

  // Middleware
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

  return app
}

export default createApp

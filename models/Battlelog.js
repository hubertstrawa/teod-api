import mongoose from 'mongoose'
import battleCurrentSchema from './schemas/BattleCurrent.js'
import battleEnemyStateSchema from './schemas/BattleEnemyState.js'

const battlelog = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
    unique: true,
  },
  enemy: {
    type: battleEnemyStateSchema,
    default: null,
  },
  current: {
    type: battleCurrentSchema,
    default: () => ({
      status: 'idle',
      isOver: true,
      turn: 0,
    }),
  },
  killedMonsters: {
    type: Map,
    of: Number,
    default: () => new Map(),
  },
  availableBoss: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enemy',
    default: null,
  },
}, {
  toJSON: { flattenMaps: true },
  toObject: { flattenMaps: true },
})

const Battlelog = mongoose.model('Battlelog', battlelog)
export default Battlelog

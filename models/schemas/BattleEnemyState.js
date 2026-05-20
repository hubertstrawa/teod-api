import mongoose from 'mongoose'

const battleEnemyLootSchema = new mongoose.Schema(
  {
    chance: {
      type: Number,
      min: 0,
      default: 0,
    },
    itemId: {
      type: String,
      default: null,
    },
  },
  { _id: false }
)

const battleEnemyStateSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enemy',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      required: true,
      default: 'normal',
      trim: true,
    },
    monsterType: {
      type: String,
      default: 'normal',
      trim: true,
    },
    power: {
      type: Number,
      required: true,
      min: 0,
    },
    health_points: {
      type: Number,
      required: true,
      min: 0,
    },
    max_health_points: {
      type: Number,
      required: true,
      min: 0,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    maxMoney: {
      type: Number,
      required: true,
      min: 0,
    },
    loot: {
      type: [battleEnemyLootSchema],
      default: [],
    },
  },
  { _id: false }
)

export default battleEnemyStateSchema

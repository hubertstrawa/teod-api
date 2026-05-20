import mongoose from 'mongoose'

const enemySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  image: { type: String },
  type: {
    type: String,
    default: 'normal',
    enum: ['normal', 'electric', 'fire', 'water'],
  },
  monsterType: { type: String },
  level: { type: Number },
  power: { type: Number },
  health_points: { type: Number },
  max_health_points: { type: Number },
  experience: { type: Number },
  maxMoney: { type: Number },
  loot: {
    type: [{ chance: Number, id: String }],
  },
  location: { type: String },
})

const Enemy = mongoose.model('Enemy', enemySchema)
export default Enemy

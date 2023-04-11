const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  enemyId: {
    type: Number,
  },
  minLevel: {
    type: Number,
    default: 1,
  },
  countStart: {
    type: Number,
    default: 0,
  },
  countEnd: {
    type: Number,
  },
  bossId: {
    type: Number,
  },
  taskPointsAdd: {
    type: Number,
  },
  location: {
    type: String,
    default: 'forgotten-forest',
  },
})

module.exports = mongoose.model('Task', taskSchema)

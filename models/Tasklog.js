const mongoose = require('mongoose')

const tasklogSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
    unique: true,
  },
  activeTask: {},
  taskPoints: {
    type: Number,
    default: 0,
  },
})

module.exports = mongoose.model('Tasklog', tasklogSchema)

const mongoose = require('mongoose')

const questLogSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
    unique: true,
  },
  // playerId: {
  //   type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  // },
  activeQuests: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quest' }],
    default: [],
    // { _id: '640ba6386a185fc05a969e29' }
  },
  completedQuests: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quest' }],
    default: [],
  },
})

module.exports = mongoose.model('Questlog', questLogSchema)

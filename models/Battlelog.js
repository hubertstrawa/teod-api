const mongoose = require('mongoose')

const battlelog = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
    unique: true,
  },
  enemy: {},
  current: {},
  // current: {
  //   playerAttack: { type: Number },
  //   enemyAttack: { type: Number },
  //   isNew: { type: Boolean },
  // },
  killedMonsters: [],
})

module.exports = mongoose.model('Battlelog', battlelog)

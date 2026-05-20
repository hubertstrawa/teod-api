import mongoose from 'mongoose'

const battlelog = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
    unique: true,
  },
  enemy: {},
  current: {},
  killedMonsters: {},
  availableBoss: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enemy',
  },
})

const Battlelog = mongoose.model('Battlelog', battlelog)
export default Battlelog

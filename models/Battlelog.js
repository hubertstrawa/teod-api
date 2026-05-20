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
  // current: {
  //   playerAttack: { type: Number },
  //   enemyAttack: { type: Number },
  //   isNew: { type: Boolean },
  // },
  // killedMonsters: {},
  // availableBoss: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Enemy',
  // },
  // pvp: {
  //   pvpInvitedPlayer: {
  //     type: String,
  //   },
  //   pvpEnemyPlayerName: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Player',
  //   },
  //   pvpEnemyData: { type: Object, default: {} },
  //   current: { type: Object, default: {} },
  //   turn: { type: Number, default: 0 },
  //   responded: { type: Boolean, default: false },
  //   turnPlayer: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Player',
  //   },
  //   attacks: {
  //     type: Object,
  //     default: {
  //       spellType: String,
  //       attackValue: Number,
  //     },
  //   },
  // },
})

const Battlelog = mongoose.model('Battlelog', battlelog)
export default Battlelog

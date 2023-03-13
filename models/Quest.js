const mongoose = require('mongoose')

const questSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  minLevel: {
    type: Number,
    default: null,
  },
  requiredItems: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    default: [],
  },
  rewardItems: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    default: [],
  },
  rewardExp: {
    type: Number,
    default: 0,
  },
  rewardMoney: {
    type: Number,
    default: 0,
  },
})

module.exports = mongoose.model('Quest', questSchema)

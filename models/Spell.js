const mongoose = require('mongoose')

const spellSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  spellType: {
    type: String,
  },
  description: {
    type: String,
  },
  spellLevel: {
    type: Number,
    default: 1,
  },
  power: {
    type: Number,
  },
  manaCost: {
    type: Number,
  },
  possibleEveryTurn: {
    type: Number,
    default: 1,
  },
  minIntelligence: {
    type: Number,
    default: 10,
  },
})

module.exports = spellSchema

const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  image: { type: String },
  state: {
    type: String,
    default: 'common',
    enum: ['common', 'rare', 'legendary'],
  },
  attack: { type: Number },
  defense: { type: Number },
  resistance: {
    normal: {
      type: Number,
    },
    fire: {
      type: Number,
    },
    electric: {
      type: Number,
    },
    water: {
      type: Number,
    },
    bug: {
      type: Number,
    },
  },
  type: { type: String },
  canBeSold: {
    type: Boolean,
    default: true,
  },
  learnSpell: {
    type: String,
  },
  attributes: {
    strength: {
      type: Number,
      default: 0,
    },
    intelligence: {
      type: Number,
      default: 0,
    },
    vitality: {
      type: Number,
      default: 0,
    },
    manaVitality: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    agility: {
      type: Number,
      default: 0,
    },
  },
  value: { type: Number },
})

module.exports = mongoose.model('Item', itemSchema)

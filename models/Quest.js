const mongoose = require('mongoose')

const questSchema = new mongoose.Schema({
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
  },
  attack: { type: Number },
  defense: { type: Number },
})

module.exports = mongoose.model('Quest', questSchema)

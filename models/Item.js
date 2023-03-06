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
  },
  attack: { type: Number },
  defense: { type: Number },
  type: { type: String },
})

module.exports = mongoose.model('Item', itemSchema)

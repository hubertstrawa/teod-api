const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
  jobId: {
    type: Number,
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  location: {
    type: String,
  },
  timeStart: { type: Date, default: Date.now },
  timeEnd: {
    type: Date,
    default: () => new Date(+new Date() + 4 * 60 * 60 * 1000),
  },
  possibleLoot: {
    type: [{ chance: Number, id: String }],
  },
})

module.exports = jobSchema

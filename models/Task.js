import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  enemyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enemy',
  },
  minLevel: {
    type: Number,
    default: 1,
  },
  countStart: {
    type: Number,
    default: 0,
  },
  countEnd: {
    type: Number,
  },
  bossId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enemy',
  },
  taskPointsAdd: {
    type: Number,
  },
  location: {
    type: String,
    default: 'forgotten-forest',
  },
})

const Task = mongoose.model('Task', taskSchema)
export default Task

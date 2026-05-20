import mongoose from 'mongoose'
import activeTaskSchema from './schemas/ActiveTask.js'

const tasklogSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
    unique: true,
  },
  activeTask: {
    type: activeTaskSchema,
    default: null,
  },
  taskPoints: {
    type: Number,
    default: 0,
  },
})

const Tasklog = mongoose.model('Tasklog', tasklogSchema)
export default Tasklog

import mongoose from 'mongoose'

const tasklogSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
    unique: true,
  },
  activeTask: {},
  taskPoints: {
    type: Number,
    default: 0,
  },
})

const Tasklog = mongoose.model('Tasklog', tasklogSchema)
export default Tasklog

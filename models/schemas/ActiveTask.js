import mongoose from 'mongoose'

const activeTaskSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['active'],
      default: 'active',
    },
    countStart: {
      type: Number,
      required: true,
      min: 0,
    },
    countEnd: {
      type: Number,
      required: true,
      min: 0,
    },
    idTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bossId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enemy',
      required: true,
    },
    enemyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enemy',
      required: true,
    },
    taskPointsAdd: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
)

export default activeTaskSchema

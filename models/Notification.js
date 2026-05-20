import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  type: {
    type: String, // 'friendRequest', 'message', etc.
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
  data: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: new Date(),
  },
})

export default notificationSchema

// const Notification = mongoose.model('Notification', notificationSchema)
// export default Notification

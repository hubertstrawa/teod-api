import mongoose from 'mongoose'

const friendsSchema = new mongoose.Schema({
  pending: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    default: [],
  },
  list: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    default: [],
  },
  date: {
    type: Date,
    default: new Date(),
  },
})

export default friendsSchema

// const Notification = mongoose.model('Notification', notificationSchema)
// export default Notification

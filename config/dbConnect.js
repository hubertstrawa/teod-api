import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log('Connected to the database')
  } catch (err) {
    console.error('Error connecting to the database:', err.message)
    process.exit(1) // Exit the process if the connection fails
  }
}

export default connectDB

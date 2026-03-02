import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config()

const connectDb = async() => {
  try {
    const connectionInstance = mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${connectionInstance.connection.host}`)
  } catch (err) {
    console.log(err.message?.error)
  }
}

export default connectDb;
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.MONGO_URI as string;

const connectDB = async (): Promise<void> => {
  try {
    const data = await mongoose.connect(dbUrl);
    console.log(`✅ Database connected with ${data.connection.host}`);
  } catch (error: any) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;

import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI!;
    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(connStr);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

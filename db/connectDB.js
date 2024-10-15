import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log(process.env.MONGODB_URL);
    const con = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`Database connected successfully!: ${con.connection.host}`);
  } catch (err) {
    console.log(`Error while connecting to DB: ${err.message}`);
    process.exit(1); // 1 for failur, 0 for success
  }
};

import mongoose from "mongoose";
import { DB_Name } from "../constants.js";
const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_Name}`
    );
    // console.log(`CI${connectionInstance}`);
    console.log(
      `\n MongoDB Connected!! HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB Connection Error ", error);
    process.exit(1);
  }
};

export default connectDb;

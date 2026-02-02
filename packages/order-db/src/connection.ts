import mongoose from "mongoose";
let isDBConnected = false;

export const connectOrderDb = async () => {
  if (isDBConnected) {
    return;
  }
  if (!process.env.MONGO_URL) {
    throw new Error("Please provide MONGO_URI in the environment variables");
  }
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Order DB connected successfully");
    isDBConnected = true;
  } catch (error) {
    console.log(error);
  }
};

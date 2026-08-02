import mongoose from "mongoose";

const connectDb = async ()=>{
  try{
    const connection = await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("Mongo DB connected Successfully", connection.connection.host);
  } catch (error) {
    console.log("Mongo DB failed to connect", error);
    process.exit(1);
  }
};
export default connectDb;
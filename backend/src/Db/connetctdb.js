import mongoose from "mongoose";

const connectDb = async ()=>{
  try{
    const connection = await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("Mongo Db connected Successfully",connection.connection.host)
  }
  catch(error){
    console.log("mongo db failed to connect",error)
    exit(1);
  }
};
export default connectDb;
import express from 'express'
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.get('/',(req,res)=>{
  res.send("hiii")
})


app.listen(process.env.PORT,()=>{
  console.log(`system is running at port ${process.env.PORT}`);
})
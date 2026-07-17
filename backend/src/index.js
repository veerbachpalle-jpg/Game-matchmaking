import express from 'express'
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.get('/',(req,res)=>{
  res.send("hiii")
})

import connectDb from './Db/connetctdb';
connectDb().then(app.listen(process.env.PORT,()=>{
  console.log(`system is running at port ${process.env.PORT}`);
})).
catch((error)=>
  console.log(error)
)

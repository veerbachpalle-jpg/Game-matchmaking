import { asynchandler } from "../utils/AsyncHandler";
import { User } from "../models/user.models";
import { apiError } from "../utils/Apierrors";


const registeruser = asynchandler(async(req,res)=>{
  const {username,email,password}= req.body
  if(
    [username,email,password].some((field) => field?.trim() ===""
  )){
    throw new apiError(400,"All fields are compulsory")
  }
  const existeduser = await User.findOne({
    $or =[{username},{email}];
  })
})
if(existeduser){
  throw new apiError(409,"User with same username or email exists");
}
const avatarlocalpath = req.files?.avatar?.[0].path;
const coverimagepath = req.files?.coverimage?.[0].path;

if(!avatarlocalpath){
  throw new apiError(400, 
    "avatar image is compulsory"
  )
}

 
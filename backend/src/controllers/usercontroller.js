import { asynchandler } from "../utils/AsyncHandler";
import { User } from "../models/user.models";
import { apiError } from "../utils/Apierrors";
import { uploadoncloudinary } from "../utils/cloudinary";


const generateAccessandRefreshtokens = async (userid)=>{
  try{
    const user = await User.findById(userid)
    const refreshtoken = await user.generateRefreshTokens()
    const Accesstokens = await user.generateAccessTokens()

    await user.save({validateBeforeSave:false})
  }
  catch(error){
    console.log("error in generating access and refreshtokens",error)
    throw error
  }
}


const registeruser = asynchandler(async(req,res)=>{
  const {username,email,password}= req.body
  if(
    [username,email,password].some((field) => field?.trim() ===""
  )){
    throw new apiError(400,"All fields are compulsory")
  }
  const existeduser = await User.findOne({
    $or =[{username},{email}]
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
 avatar = await uploadoncloudinary(avatarlocalpath);
 coverimagepath = await uploadoncloudinary(coverimagepath)

 const user = await User.create({
  username,
  password,
  avatar: avatar.url,
  coverimage: coverimage?.url,
  email
 })

 const createduser = User.findById(user._id).select("-password -refreshtoken")

 if(!createduser){
  throw new apiError(500,"something went wrong while registering user")
 }

 return res.statuscode(200).json(
  new apiresponse(200,createduser,"User registered successfully")
 )

})


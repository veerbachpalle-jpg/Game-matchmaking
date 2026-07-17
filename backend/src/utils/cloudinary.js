import {v2 as cloudinary} from 'cloudiary';
import fs from 'fs'
import mongoose from 'mongoose';

cloudinary.config({
  cloudinary_name = process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api = process.env.CLOUDINARY_API_KEY,
  api_secret = process.env.CLOUDINARY_API_SECRET
}
);

const uploadoncloudinary = async (localfilepath)=>{
  try{
    if(!localfilepath){
      console.log("local file path is not found")
      return null
    }
    const response = await cloudinary.uploader.upload(localfilepath,{
      response_type:"auto"
    })

    console.log("File uploaded successsfully",response.secure_url)

    if(fs.existsSync(localfilepath)){
      fs.unlinkSync(localfilepath)
    }
    return response
  } catch(error){
    console.log("cloudinary error",error)

    if(fs.existsSync(localfilepath))
      fdatasync.unlinkSync(localfilepath)
  }

}

export {uploadoncloudinary}
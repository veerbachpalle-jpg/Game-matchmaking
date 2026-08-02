import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
};

const uploadoncloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) {
      console.log("local file path is not found");
      return null;
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log("Cloudinary credentials not set in environment, using default image URL");
      if (fs.existsSync(localfilepath)) {
        fs.unlinkSync(localfilepath);
      }
      return {
        url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop",
        secure_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop"
      };
    }

    configureCloudinary();

    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto"
    });

    console.log("File uploaded successfully to Cloudinary:", response.secure_url);

    if (fs.existsSync(localfilepath)) {
      fs.unlinkSync(localfilepath);
    }
    return response;
  } catch (error) {
    console.log("Cloudinary upload error:", error);

    if (fs.existsSync(localfilepath)) {
      fs.unlinkSync(localfilepath);
    }
    return null;
  }
};

export { uploadoncloudinary };
import { asynchandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.models.js";
import { apiError } from "../utils/Apierrors.js";
import mongoose from "mongoose";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import { apiresponse } from "../utils/apiresponse.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

const generateAccessandRefreshtokens = async (userid) => {
  try {
    const user = await User.findById(userid)
    const refreshtoken = await user.generateRefreshTokens()
    const Accesstokens = await user.generateAccessTokens()

    user.refreshtoken = refreshtoken
    await user.save({ validateBeforeSave: false })
    return { Accesstokens, refreshtoken }
  }
  catch (error) {
    console.log("error in generating access and refreshtokens", error)
    throw error
  }
}


const registeruser = asynchandler(async (req, res) => {
  const { username, email, password } = req.body
  if (
    [username, email, password].some((field) => !field || field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are compulsory")
  }
  const existeduser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existeduser) {
    throw new apiError(409, "User with same username or email exists");
  }

  const avatarlocalpath = req.files?.avatar?.[0]?.path;
  const coverimagelocalpath = req.files?.coverimage?.[0]?.path;

  if (!avatarlocalpath) {
    throw new apiError(400, "avatar image is compulsory")
  }

  const avatar = await uploadoncloudinary(avatarlocalpath);
  const coverimage = coverimagelocalpath ? await uploadoncloudinary(coverimagelocalpath) : null;

  if (!avatar) {
    throw new apiError(500, "Error uploading avatar to cloud storage");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const emailOtpExpiry = new Date(Date.now() + 60 * 60 * 1000);

  const user = await User.create({
    username,
    password,
    avatar: avatar.secure_url || avatar.url,
    coverimage: coverimage ? (coverimage.secure_url || coverimage.url) : "",
    email,
    isverified: true,
    status: "online",
    emailOtp: otp,
    emailOtpExpiry
  })

  const createduser = await User.findById(user._id).select("-password -refreshtoken")

  if (!createduser) {
    throw new apiError(500, "something went wrong while registering user")
  }

  const { Accesstokens, refreshtoken } = await generateAccessandRefreshtokens(user._id);

  // Dispatch email asynchronously so registration UI transitions instantly
  sendVerificationEmail(createduser.email, otp).catch((err) =>
    console.error("Async email dispatch error:", err)
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  };

  return res
    .status(200)
    .cookie("accesstoken", Accesstokens, options)
    .cookie("refreshtoken", refreshtoken, options)
    .json(
      new apiresponse(
        200,
        { user: createduser, Accesstokens, refreshtoken },
        "User registered successfully"
      )
    );
})

const loginuser = asynchandler(async (req, res) => {
  const { username, email, password } = req.body
  if (!(username || email)) {
    throw new apiError(400, "username or email is required")
  }
  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (!user) {
    throw new apiError(404, "User does not exist")
  }

  const ispasswordvalid = await user.checkpassword(password)
  if (!ispasswordvalid) {
    throw new apiError(401, "invalid user credentials")
  }

  const { Accesstokens, refreshtoken } = await generateAccessandRefreshtokens(user._id)
  const loggedinuser = await User.findById(user._id).select("-password -refreshtoken")

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }

  return res
    .status(200)
    .cookie("accesstoken", Accesstokens, options)
    .cookie("refreshtoken", refreshtoken, options)
    .json(
      new apiresponse(
        200,
        { user: loggedinuser, Accesstokens, refreshtoken },
        "User logged in successfully"
      )
    )
})

const adminlogin = asynchandler(async (req, res) => {
  const { username, email, password } = req.body
  if (!(username || email)) {
    throw new apiError(400, "username or email is required")
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (!user) {
    throw new apiError(404, "User does not exist")
  }

  if (user.role !== "admin") {
    throw new apiError(403, "Access denied. Admin privileges required")
  }

  const ispasswordvalid = await user.checkpassword(password)
  if (!ispasswordvalid) {
    throw new apiError(401, "invalid admin credentials")
  }

  const { Accesstokens, refreshtoken } = await generateAccessandRefreshtokens(user._id)
  const loggedinadmin = await User.findById(user._id).select("-password -refreshtoken")

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }

  return res
    .status(200)
    .cookie("accesstoken", Accesstokens, options)
    .cookie("refreshtoken", refreshtoken, options)
    .json(
      new apiresponse(
        200,
        { user: loggedinadmin, Accesstokens, refreshtoken },
        "Admin logged in successfully"
      )
    )
})

const logoutuser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshtoken: undefined
      }
    },
    { returnDocument: 'after' }
  )
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
  return res
    .status(200)
    .clearCookie("accesstoken", options)
    .clearCookie("refreshtoken", options)
    .json(
      new apiresponse(200, {}, "User logged out successfully")
    )
})

const changepassword = asynchandler(async (req, res) => {
  const { password, newpassword } = req.body
  const user = await User.findById(req.user._id)
  const validatepassword = await user.checkpassword(password)
  if (!validatepassword) {
    throw new apiError(400, "old password is incorrect")
  }
  user.password = newpassword
  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(
      new apiresponse(200, {}, "User password changed successfully")
    )
})

const addfriends = asynchandler(async (req, res) => {
  const userid = req.user._id
  const { friendId, add, username } = req.body
  let targetFriendId = friendId || add

  // Allow adding by username if no ID was given
  if (!targetFriendId && username) {
    const found = await User.findOne({ username: username.toLowerCase().trim() })
    if (!found) {
      throw new apiError(404, "No user found with that username")
    }
    targetFriendId = found._id.toString()
  }

  if (!targetFriendId) {
    throw new apiError(400, "Friend ID or username is required")
  }
  if (!mongoose.Types.ObjectId.isValid(targetFriendId)) {
    throw new apiError(400, "Invalid friend Id")
  }
  if (userid.toString() === targetFriendId) {
    throw new apiError(400, "user cannot add itself to friend list")
  }
  const currentuser = await User.findById(userid)
  const frienduser = await User.findById(targetFriendId)
  if (!currentuser || !frienduser) {
    throw new apiError(404, "User not found")
  }
  if (currentuser.friends.some(id => id.toString() === targetFriendId)) {
    throw new apiError(400, "users are already friends")
  }
  await currentuser.addfriends(frienduser._id)
  await frienduser.addfriends(currentuser._id)

  await currentuser.save({ validateBeforeSave: false })
  await frienduser.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(
      new apiresponse(200, { friendUsername: frienduser.username }, "friend added successfully")
    )
})

const searchUsers = asynchandler(async (req, res) => {
  const query = (req.query.q || "").trim()
  if (!query || query.length < 1) {
    return res.status(200).json(new apiresponse(200, [], "Provide a search term"))
  }

  const currentUserId = req.user._id

  // Case-insensitive partial match on username, exclude self and bots
  const users = await User.find({
    $and: [
      { username: { $regex: query, $options: "i" } },
      { username: { $not: /^bot_/ } },
    ],
    _id: { $ne: currentUserId },
  })
    .select("username avatar rank mmr status")
    .limit(10)

  return res.status(200).json(
    new apiresponse(200, users, "Search results")
  )
})

const getcurrentuser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new apiresponse(200, req.user, "current user fetched successfully")
    )
})

const getallusers = asynchandler(async (req, res) => {
  const users = await User.find().select("-password -refreshtoken")
  return res
    .status(200)
    .json(
      new apiresponse(200, users, "all users fetched successfully")
    )
})

const deleteuserbyid = asynchandler(async (req, res) => {
  const { userId } = req.params
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new apiError(400, "Invalid user Id")
  }
  const user = await User.findByIdAndDelete(userId)
  if (!user) {
    throw new apiError(404, "User not found")
  }
  return res
    .status(200)
    .json(
      new apiresponse(200, {}, "User deleted successfully")
    )
})

const updateuserrole = asynchandler(async (req, res) => {
  const { userId } = req.params
  const { role } = req.body
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new apiError(400, "Invalid user Id")
  }
  if (!["user", "admin"].includes(role)) {
    throw new apiError(400, "Invalid role. Must be 'user' or 'admin'")
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { returnDocument: 'after' }
  ).select("-password -refreshtoken")

  if (!user) {
    throw new apiError(404, "User not found")
  }
  return res
    .status(200)
    .json(
      new apiresponse(200, user, "User role updated successfully")
    )
})

const updateuseravatar = asynchandler(async (req, res) => {
  const avatarlocalpath = req.file?.path || req.files?.avatar?.[0]?.path;

  if (!avatarlocalpath) {
    throw new apiError(400, "Avatar file is missing");
  }

  const avatar = await uploadoncloudinary(avatarlocalpath);

  const avatarUrl = avatar?.secure_url || avatar?.url;
  if (!avatarUrl) {
    throw new apiError(500, "Error uploading avatar to cloud storage");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatarUrl
      }
    },
    { returnDocument: 'after' }
  ).select("-password -refreshtoken");

  return res
    .status(200)
    .json(
      new apiresponse(200, user, "Avatar updated successfully")
    );
});

const updateusercoverimage = asynchandler(async (req, res) => {
  const coverimagelocalpath = req.file?.path || req.files?.coverimage?.[0]?.path;

  if (!coverimagelocalpath) {
    throw new apiError(400, "Cover image file is missing");
  }

  const coverimage = await uploadoncloudinary(coverimagelocalpath);

  if (!coverimage) {
    throw new apiError(500, "Error uploading cover image to cloud storage");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverimage: coverimage.secure_url || coverimage.url
      }
    },
    { returnDocument: 'after' }
  ).select("-password -refreshtoken");

  return res
    .status(200)
    .json(
      new apiresponse(200, user, "Cover image updated successfully")
    );
});

const verifyEmail = asynchandler(async (req, res) => {
  const { otp } = req.body;
  if (!otp) {
    throw new apiError(400, "OTP is required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new apiError(404, "User not found");
  }

  if (user.isverified) {
    return res.status(200).json(
      new apiresponse(200, user, "User email is already verified")
    );
  }

  if (!user.emailOtp || user.emailOtp !== otp.toString().trim()) {
    throw new apiError(400, "Invalid OTP code");
  }

  if (user.emailOtpExpiry && new Date(user.emailOtpExpiry) < new Date()) {
    throw new apiError(400, "OTP code has expired. Please request a new code.");
  }

  user.isverified = true;
  user.emailOtp = undefined;
  user.emailOtpExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(user._id).select("-password -refreshtoken");

  return res.status(200).json(
    new apiresponse(200, updatedUser, "Email verified successfully")
  );
});

const resendOtp = asynchandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new apiError(404, "User not found");
  }

  if (user.isverified) {
    return res.status(200).json(
      new apiresponse(200, user, "User email is already verified")
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const emailOtpExpiry = new Date(Date.now() + 60 * 60 * 1000);

  user.emailOtp = otp;
  user.emailOtpExpiry = emailOtpExpiry;
  await user.save({ validateBeforeSave: false });

  sendVerificationEmail(user.email, otp).catch((err) =>
    console.error("Async email dispatch error:", err)
  );

  return res.status(200).json(
    new apiresponse(200, {}, "Verification OTP sent successfully")
  );
});

export {
  registeruser,
  loginuser,
  adminlogin,
  logoutuser,
  changepassword,
  addfriends,
  searchUsers,
  getcurrentuser,
  getallusers,
  deleteuserbyid,
  updateuserrole,
  updateuseravatar,
  updateusercoverimage,
  verifyEmail,
  resendOtp
}
import jwt from "jsonwebtoken"
import { User } from "../models/user.models"
import { apiError } from "../utils/Apierrors"
import { asynchandler } from "../utils/AsyncHandler"

const verifyJWT = asynchandler(async (req, res, next) => {
  const token =
    req.cookies?.accesstoken ||
    req.header("Authorization")?.replace("Bearer ", "")

  if (!token) {
    throw new apiError(401, "Unauthorized request")
  }

  const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

  const user = await User.findById(decodedtoken._id).select(
    "-password -refreshtoken"
  )

  if (!user) {
    throw new apiError(401, "Invalid access token")
  }

  req.user = user
  next()
})

const verifyAdmin = asynchandler(async (req, res, next) => {
  if (!req.user) {
    throw new apiError(401, "Unauthorized request")
  }

  if (req.user.role !== "admin") {
    throw new apiError(403, "Admin access required")
  }

  next()
})

export { verifyJWT, verifyAdmin }

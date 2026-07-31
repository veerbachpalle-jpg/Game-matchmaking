import mongoose, {Schema} from 'mongoose';
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'

const UserSchema = new Schema({
  username:{
    type: String,
    required : true,
    unique: true,
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  avatar:{
    type: String,
    required:true,
  },
  coverimage: {
    type: String,
    default: ""
  },
  rank: {
    type: String,
    default: "Bronze"
  },
  mmr: {
    type: Number,
    default: 1000
  },
  role:{
    type:String,
    enum:["user","admin"],
    default:"user"
  },
  refreshtoken:{
    type:String
  },
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: "User"
    }],
  status: {
      type:String,
      default:"offline"
  }

},{timestamps:true})

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});
UserSchema.methods.checkpassword= async function (password) {
  return await bcrypt.compare(password,this.password)
}
UserSchema.methods.generateAccessTokens = async function(){
  return  jwt.sign({
    _id:this._id,
    username: this.username,
    email:this.email,
    role:this.role
  },
  process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "access_token_secret_fallback",
  {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d"
  }
  )
}

UserSchema.methods.generateRefreshTokens = async function(){
  return jwt.sign({
    _id:this._id
  }, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || "refresh_token_secret_fallback", {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d"
  }
)
}
UserSchema.methods.addfriends = async function (friendId) {
  if(!this.friends.includes(friendId))
    this.friends.push(friendId)
  
  }


export const User = mongoose.model("User",UserSchema)
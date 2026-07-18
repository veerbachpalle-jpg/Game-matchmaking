import mongoose, {Schema} from 'mongoose';
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import { type } from 'os';

const UserSchema = new Schema({
  username:{
    type: String,
    required : true,
    unique: true,
    lowercase:true,
    index:true,
    trim:true
  },
  email:{
    type: String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true
  },
  password:{
    type:String,
    required : [true,"Password is required"]

  },
  avatar:{
    type: String,
    required:true,
  },
  coverimage:{
    type:String,
    required: true
  },
  rank:{
    type:String
  },

  refreshtoken:{
    type:String
  },
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: "User"
    }]

},{timestamps:true})

UserSchema.pre("save",async function(next){
  if(!this.isModified(this.password))return
  this.password = await hash.bcrypt(this.password,10)

})
UserSchema.methods.checkpassword= async function (password) {
  return await bcrypt.compare(password,this.password)
}
UserSchema.methods.generateAccessTokens = async function(){
  return  jwt.sign({
    _id:this._id,
    username: this.username,
    email:this.email
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  }
  )
}

UserSchema.methods.generateRefreshTokens = async function(){
  return jwt.sign({
    _id:this._id
  },process.env.REFRESH_TOKEN_SECRET,{
    expiresIn:process.env.REFRESH_TOKEN_EXPIRY
  }
)
}
UserSchema.methods.addfriends = async function (friendId) {
  if(!this.friends.includes(friendId))
    this.friends.push(friendId)
  
}


export const User = mongoose.model("User",UserSchema)
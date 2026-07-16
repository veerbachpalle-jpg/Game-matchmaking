import mongoose, {Schema} from 'mongoose';

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
  }
},{timestamps:true})

export const User = mongoose.model("User",UserSchema)
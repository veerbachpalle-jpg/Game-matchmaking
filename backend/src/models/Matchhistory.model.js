import { Schema, model } from "mongoose";

const MatchhistorySchema = new Schema({
  players:[{
    user:{
      type:Schema.Types.ObjectId,
      ref:"User",
      required: true
    },
    mmratmatch:{
      type:Number,
      required: true
    }
  }],
  gameMode:{
    type:String,
    required:true,
    enum:["1v1","four-player"]
  },
  status:{
    type:String,
    enum:["grouped","completed","cancelled"],
    default:"grouped",
  },
  result:{
    winnerId:{
      type:User.Types.ObjectId,
      ref:"User"
    },
    scores:{
      type:Map,
      of: Number,
    },

  },
  createdAt:{
    type:Date,
    default:Date.now
  }
})

export const Matchhistory = model("Matchhistory",MatchhistorySchema)
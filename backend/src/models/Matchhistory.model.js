import { Schema, model } from "mongoose";
import { User } from "./user.models.js";
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
    enum:["grouped","ongoing","completed","cancelled"],
    default:"grouped",
  },
  // For 1v1 games: store the definitive X and O player assignments
  playerX: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  playerO: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  result:{
    winnerId:{
      type: Schema.Types.ObjectId,
      ref:"User"
    },
    scores:{
      type:Map,
      of: Number,
    },
    mmrChanges:{
      type: Schema.Types.Mixed
    }
  },
  createdAt:{
    type:Date,
    default:Date.now
  }
})

export const Matchhistory = model("Matchhistory",MatchhistorySchema)
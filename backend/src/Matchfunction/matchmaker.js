import { User } from "../models/user.models";
import { redis } from "./redisclient";
import { asynchandler } from "../utils/AsyncHandler";
import mongoose from "mongoose";

const {types}= mongoose

const Regions = ['mid-india','south-india','north-india']

const gamemode = ['single-player','four-player']

export const matchmaker = {
  asynchandler(
    
  )
}
import { User } from "../models/user.models";
import { redis } from "./redisclient";
import { asynchandler } from "../utils/AsyncHandler";
import mongoose from "mongoose";
import {Server} from "socket.io";

const {types}= mongoose

const REGIONS = ['mid-india','south-india','north-india']

const GAMEMODES= ['single-player','four-player']

export const matchmaker = {
  async addticket(
    userId,
    username,
    mmr,
    ping,
    region,
    gamemode
  ){
    const queuekey = `queue:${gamemode}:${region}`
    const ticketkey = `ticket:${userId}`
    const joinedAt = Date.now()

    await redis.hset(ticketkey,{
      userId,
      username,
      mmr: mmr.toString(),
      ping:ping.toString(),
      joinedAt:joinedAt.toString(),
      region,
      gamemode,

    });

    await redis.zadd(queuekey,mmr,userId)

    await User.findByIdAndUpdate(userId,{
      status:'Inqueue'
    });
  },
  async removeticket(userId){
    const ticketkey = `ticket:${userId}`
    
    const ticketdata = await redis.hgetall(ticketkey)

    if(Object.keys(ticketdata).length>0){
      const {gamemode,region}= ticketdata
      const queuekey = `queue:${gamemode}:${region}`

      await redis.zrem(queuekey,userId);

      await redis.del(ticketkey)
    }
    await User.findByIdAndUpdate(userId,{status: 'online'})
  },
  async getticket(userId){
    const ticketkey = `ticket:${userId}`

    const data = await redis.hgetall(ticketkey)

    if(Object.keys(data).length===0)return null

    return{
      userId: data.userId,
      username: data.username,
      mmr: parseInt(data.mmr, 10),
      region: data.region,
      ping: parseInt(data.ping, 10),
      gamemode: data.gameMode,
      joinedAt: parseInt(data.joinedAt, 10),
    }
  },
  startWorker(io){
    console.log("Matchmaking started")
    setInterval(async ()=>{
    try {
      for(const gamemode of gameModes){
        for(const region of REGIONS){
            await this.processQueue(
              gameMode,
              region,
              io
            );
        }
      }
    } catch (error) {
      console.log("Error in matchmaking worker loop",error)
    }},2000)
  },
  async processQueue(gameMode,region,io){
    const queuekey = `queue${gameMode}:${region}`

    const userids = await redis.zrange(queuekey,0,-1);

    if(userids.length===0)return

    const tickets =[]

    for(const userid of userids){
      ticket = await this.getticket(userid)

      if(!ticket){
        await redis.zrem(queuekey,ticket)
      }
      else{
        tickets.push(ticket)
      }
    }

    tickets.sort((a,b)=> a.joinedAt - b.joinedAt)
     const matchedUserIds = new Set();

  for (let i = 0; i < tickets.length; i++) {

    const ticketA = tickets[i];

    if (matchedUserIds.has(ticketA.userId)) {
      continue;
    }

    const waitTimeSeconds =
      (Date.now() - ticketA.joinedAt) / 1000;

    // Expand MMR range as player waits longer
    const allowedMmrDelta = Math.min(
      100 + Math.floor(waitTimeSeconds / 5) * 50,
      1000
    );

    const candidates = [];

    const requiredCandidates =
      gameMode === "1v1" ? 1 : 3;

    for (let j = i + 1; j < tickets.length; j++) {

      const ticketB = tickets[j];

      if (matchedUserIds.has(ticketB.userId)) {
        continue;
      }

      // Check MMR
      const mmrDelta =
        Math.abs(ticketA.mmr - ticketB.mmr);

      if (mmrDelta <= allowedMmrDelta) {

        // Check Ping
        const pingDelta =
          Math.abs(ticketA.ping - ticketB.ping);

        if (pingDelta <= 80) {

          candidates.push(ticketB);

          if (
            candidates.length === requiredCandidates
          ) {
            break;
          }
        }
      }
    }

    // Match Found
    if (candidates.length === requiredCandidates) {

      const matchGroup = [
        ticketA,
        ...candidates
      ];

      // Mark users as matched
      matchGroup.forEach((player) => {
        matchedUserIds.add(player.userId);
      });

      // Redis transaction
      const multi = redis.multi();

      matchGroup.forEach((player) => {

        multi.zrem(queueKey, player.userId);

        multi.del(`ticket:${player.userId}`);

      });

      await multi.exec();

      // Create game
      await this.handleMatchSuccess(
        gameMode,
        region,
        matchGroup,
        io
      );
    }
  }
 },

}
import { User } from "../models/user.models.js";
import { redis } from "./redisclient.js";
import { asynchandler } from "../utils/AsyncHandler.js";
import mongoose from "mongoose";
import { Matchhistory } from "../models/Matchhistory.model.js";
import { gameManager } from "./gameManager.js";

const REGIONS = ['mid-india', 'south-india', 'north-india'];
const GAMEMODES = ['1v1', 'four-player'];

export const matchmaker = {
  async addticket(
    userId,
    username,
    mmr,
    ping,
    region,
    gamemode
  ) {
    const queuekey = `queue:${gamemode}:${region}`
    const ticketkey = `ticket:${userId}`
    const joinedAt = Date.now()

    await redis.hset(ticketkey, {
      userId,
      username,
      mmr: mmr.toString(),
      ping: ping.toString(),
      joinedAt: joinedAt.toString(),
      region,
      gamemode,

    });

    await redis.zadd(queuekey, mmr, userId)

    await User.findByIdAndUpdate(userId, {
      status: 'Inqueue'
    });
  },
  async removeticket(userId) {
    const ticketkey = `ticket:${userId}`

    const ticketdata = await redis.hgetall(ticketkey)

    if (Object.keys(ticketdata).length > 0) {
      const { gamemode, region } = ticketdata
      const queuekey = `queue:${gamemode}:${region}`

      await redis.zrem(queuekey, userId);

      await redis.del(ticketkey)
    }
    await User.findByIdAndUpdate(userId, { status: 'online' })
  },
  async getticket(userId) {
    const ticketkey = `ticket:${userId}`

    const data = await redis.hgetall(ticketkey)

    if (Object.keys(data).length === 0) return null

    return {
      userId: data.userId,
      username: data.username,
      mmr: parseInt(data.mmr, 10),
      region: data.region,
      ping: parseInt(data.ping, 10),
      gamemode: data.gamemode,
      joinedAt: parseInt(data.joinedAt, 10),
    }
  },
  startWorker(io) {
    console.log("Matchmaking started")
    setInterval(async () => {
      try {
        for (const gamemode of GAMEMODES) {
          for (const region of REGIONS) {
            await this.processQueue(
              gamemode,
              region,
              io
            );
          }
        }
      } catch (error) {
        console.log("Error in matchmaking worker loop", error)
      }
    }, 2000)
  },
  async processQueue(gamemode, region, io) {
    const queuekey = `queue:${gamemode}:${region}`

    const userids = await redis.zrange(queuekey, 0, -1);

    if (userids.length === 0) return

    const tickets = []

    for (const userid of userids) {
      const ticket = await this.getticket(userid)

      if (!ticket) {
        await redis.zrem(queuekey, userid)
      }
      else {
        tickets.push(ticket)
      }
    }

    tickets.sort((a, b) => a.joinedAt - b.joinedAt)
    const matchedUserIds = new Set();

    for (let i = 0; i < tickets.length; i++) {

      const ticketA = tickets[i];

      if (matchedUserIds.has(ticketA.userId)) {
        continue;
      }

      const waitTimeSeconds =
        (Date.now() - ticketA.joinedAt) / 1000;

      const allowedMmrDelta = Math.min(
        100 + Math.floor(waitTimeSeconds / 5) * 50,
        1000
      );

      const candidates = [];

      const requiredCandidates =
        gamemode === "1v1" ? 1 : 3;

      for (let j = i + 1; j < tickets.length; j++) {

        const ticketB = tickets[j];

        if (matchedUserIds.has(ticketB.userId)) {
          continue;
        }

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

      if (candidates.length === requiredCandidates) {

        const matchGroup = [
          ticketA,
          ...candidates
        ];

        matchGroup.forEach((player) => {
          matchedUserIds.add(player.userId);
        });

        const multi = redis.multi();

        matchGroup.forEach((player) => {

          multi.zrem(queuekey, player.userId);

          multi.del(`ticket:${player.userId}`);

        });

        await multi.exec();

        await this.gamehandler(
          gamemode,
          region,
          matchGroup,
          io
        );
      }
    }
  },

  async gamehandler(gamemode, region, players, io) {
    console.log(`Match formed mode:${gamemode}, region:${region}, players:`, players.map((p) => p.username))

    const playerdbids = players.map((p) => p.userId);

    if (gamemode === '1v1') {
      await User.updateMany(
        {
          _id: {
            $in: playerdbids
          }
        },
        {
          status: "in-game"
        }
      )

      const gamerecord = new Matchhistory({
        players: players.map((player) => ({
          user: player.userId,
          mmratmatch: player.mmr
        })),
        gameMode: gamemode,
        status: 'grouped'
      })
      await gamerecord.save();

      const gameSession = gameManager.createGame(
        gamerecord._id.toString(),
        players[0].userId,
        players[1].userId
      );

      players.forEach((player) => {
        io.to(player.userId).emit("match-found", {
          matchId: gamerecord._id.toString(),
          gameMode: gamemode,
          region,
          players: players.map((p) => ({
            userId: p.userId,
            username: p.username,
            mmr: p.mmr,
          })),
          gameState: gameSession
        });
      });

    } else if (gamemode === 'four-player') {
      await User.updateMany(
        {
          _id: {
            $in: playerdbids
          }
        },
        {
          status: "online"
        }
      )

      const avgMmr = Math.round(
        players.reduce((sum, p) => sum + p.mmr, 0) / players.length
      );

      const gamerecord = new Matchhistory({
        players: players.map((player) => ({
          user: player.userId,
          mmratmatch: player.mmr
        })),
        gameMode: 'four-player',
        status: 'completed'
      })
      await gamerecord.save();

      players.forEach((player) => {
        io.to(player.userId).emit("four-player-match", {
          matchId: gamerecord._id,
          gameMode: 'four-player',
          region,
          avgMmr,
          players: players.map((p) => ({
            userId: p.userId,
            username: p.username,
            mmr: p.mmr,
            ping: p.ping,
          })),
        });
      });

      console.log(`Four-player match created: ${gamerecord._id} with players: ${players.map(p => p.username).join(', ')}`)
    }
  },

  getFourPlayerMatch: asynchandler(async (req, res) => {
    const { matchId } = req.params;

    const match = await Matchhistory.findOne({
      _id: matchId,
      gameMode: 'four-player'
    }).populate('players.user', 'username avatar rank');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Four-player match not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        matchId: match._id,
        gameMode: match.gameMode,
        status: match.status,
        players: match.players.map((p) => ({
          userId: p.user?._id || p.user,
          username: p.user?.username || "Unknown",
          avatar: p.user?.avatar || "",
          rank: p.user?.rank || "Unranked",
          mmrAtMatch: p.mmratmatch,
        })),
        result: match.result || null,
        createdAt: match.createdAt,
      },
    });
  }),

  getUserFourPlayerMatches: asynchandler(async (req, res) => {
    const userId = req.user._id;

    const matches = await Matchhistory.find({
      gameMode: 'four-player',
      'players.user': userId
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('players.user', 'username avatar rank');

    return res.status(200).json({
      success: true,
      data: matches.map((match) => ({
        matchId: match._id,
        gameMode: match.gameMode,
        status: match.status,
        players: match.players.map((p) => ({
          userId: p.user?._id || p.user,
          username: p.user?.username || "Unknown",
          avatar: p.user?.avatar || "",
          rank: p.user?.rank || "Unranked",
          mmrAtMatch: p.mmratmatch,
        })),
        result: match.result || null,
        createdAt: match.createdAt,
      })),
    });
  }),

  submitFourPlayerResult: asynchandler(async (req, res) => {
    const { matchId } = req.params;
    const { winnerId, scores } = req.body;

    const match = await Matchhistory.findOne({
      _id: matchId,
      gameMode: 'four-player'
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Four-player match not found"
      });
    }

    if (match.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: "Match result already submitted or match is cancelled"
      });
    }

    const playerIds = match.players.map(p => p.user.toString());
    if (winnerId && !playerIds.includes(winnerId)) {
      return res.status(400).json({
        success: false,
        message: "Winner must be one of the match players"
      });
    }

    match.result = {
      winnerId: winnerId || null,
      scores: scores || {}
    };
    await match.save();

    return res.status(200).json({
      success: true,
      message: "Four-player match result submitted",
      data: {
        matchId: match._id,
        result: match.result,
      },
    });
  }),
}
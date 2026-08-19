import { User } from "../models/user.models.js";
import { redis } from "./redisclient.js";
import { asynchandler } from "../utils/AsyncHandler.js";
import mongoose from "mongoose";
import { Matchhistory } from "../models/Matchhistory.model.js";
import { gameManager } from "./gameManager.js";

const botCache = [];

async function getOrCreateBotUsers(count) {
  if (botCache.length >= count) {
    return botCache.slice(0, count);
  }
  const botNames = [
    { username: "bot_viper", email: "bot_viper@arena.gg" },
    { username: "bot_ghost", email: "bot_ghost@arena.gg" },
    { username: "bot_apex", email: "bot_apex@arena.gg" },
    { username: "bot_nova", email: "bot_nova@arena.gg" },
    { username: "bot_phantom", email: "bot_phantom@arena.gg" },
    { username: "bot_cipher", email: "bot_cipher@arena.gg" },
    { username: "bot_reaper", email: "bot_reaper@arena.gg" },
  ];

  for (const b of botNames) {
    let user = await User.findOne({ username: b.username });
    if (!user) {
      user = await User.create({
        username: b.username,
        email: b.email,
        password: "botpassword123",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop",
        coverimage: "",
        rank: "Bronze",
        mmr: 1000,
        role: "user"
      });
    }
    if (!botCache.some(u => u._id.toString() === user._id.toString())) {
      botCache.push(user);
    }
  }
  return botCache.slice(0, count);
}

const REGIONS = ['mid-india', 'south-india', 'north-india'];
const GAMEMODES = ['1v1', '4v4'];

export const matchmaker = {
  async addticket(
    userId,
    username,
    mmr = 1000,
    ping = 40,
    region = "mid-india",
    gamemode = "4v4"
  ) {
    const userMmr = Number(mmr) || 1000;
    const userPing = Number(ping) || 40;
    // Map legacy "four-player" to "4v4"
    const normalizedMode = gamemode === 'four-player' ? '4v4' : gamemode;
    const queuekey = `queue:${normalizedMode}:${region}`
    const ticketkey = `ticket:${userId}`
    const joinedAt = Date.now()

    await redis.hset(ticketkey, {
      userId: userId.toString(),
      username: username || "Player",
      mmr: userMmr.toString(),
      ping: userPing.toString(),
      joinedAt: joinedAt.toString(),
      region,
      gamemode: normalizedMode,
    });

    await redis.zadd(queuekey, userMmr, userId.toString())

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
            await this.processQueue(gamemode, region, io);
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

    // ── Force-match: if exactly 2 players in a 1v1 queue, match them instantly ──
    if (gamemode === '1v1' && tickets.length === 2) {
      const [playerA, playerB] = tickets;
      console.log(
        `[Force-match] Only 2 players in 1v1 queue (${region}), matching ${playerA.username} vs ${playerB.username} instantly`
      );

      const matchGroup = [playerA, playerB];

      const multi = redis.multi();
      matchGroup.forEach((player) => {
        multi.zrem(queuekey, player.userId);
        multi.del(`ticket:${player.userId}`);
      });
      await multi.exec();

      await this.gamehandler(gamemode, region, matchGroup, io);
      return; // queue fully consumed, nothing left to do
    }

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

      // Ping tolerance grows with wait time so players aren't stuck forever.
      // Starts at 80ms, grows by 20 every 5 seconds, removed entirely after 30s.
      const allowedPingDelta = waitTimeSeconds >= 30
        ? Infinity
        : Math.min(80 + Math.floor(waitTimeSeconds / 5) * 20, 200);

      const candidates = [];

      // 1v1 needs 1 candidate (total 2), 4v4 needs 7 candidates (total 8)
      const requiredCandidates =
        gamemode === "1v1" ? 1 : 7;

      for (let j = i + 1; j < tickets.length; j++) {

        const ticketB = tickets[j];

        if (matchedUserIds.has(ticketB.userId)) {
          continue;
        }

        const mmrDelta =
          Math.abs(ticketA.mmr - ticketB.mmr);

        if (mmrDelta <= allowedMmrDelta) {

          // Check Ping (now uses relaxing threshold)
          const pingDelta =
            Math.abs(ticketA.ping - ticketB.ping);

          if (pingDelta <= allowedPingDelta) {

            candidates.push(ticketB);

            if (
              candidates.length === requiredCandidates
            ) {
              break;
            }
          }
        }
      }

      if (candidates.length < requiredCandidates && waitTimeSeconds >= 60) {
        const needed = requiredCandidates - candidates.length;
        const botUsers = await getOrCreateBotUsers(needed);
        for (let b = 0; b < needed; b++) {
          const bot = botUsers[b];
          candidates.push({
            userId: bot._id.toString(),
            username: bot.username,
            mmr: bot.mmr || 1000,
            ping: Math.floor(15 + Math.random() * 25),
            region: region,
            gamemode: gamemode,
            joinedAt: Date.now()
          });
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
      } else {
        // Broadcast queue status to the waiting player so the frontend can show
        // how many are queued and how long until a bot fills the slot.
        const botFillIn = Math.max(0, Math.ceil(60 - waitTimeSeconds));
        const realPlayerCount = tickets.filter(t => !t.username.startsWith('bot_')).length;
        io.to(ticketA.userId).emit('queue-status', {
          playersInQueue: realPlayerCount,
          waitSeconds: Math.floor(waitTimeSeconds),
          botFillIn,
          gamemode,
          region,
        });
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

      // Always put the real (non-bot) player first so they are X and go first.
      // Bots have usernames starting with "bot_".
      const sortedPlayers = [...players].sort((a, b) => {
        const aIsBot = a.username.startsWith('bot_') ? 1 : 0;
        const bIsBot = b.username.startsWith('bot_') ? 1 : 0;
        return aIsBot - bIsBot; // real users first, bots last
      });

      const gamerecord = new Matchhistory({
        players: sortedPlayers.map((player) => ({
          user: player.userId,
          mmratmatch: player.mmr
        })),
        gameMode: gamemode,
        status: 'grouped',
        playerX: sortedPlayers[0].userId,
        playerO: sortedPlayers[1].userId
      })
      await gamerecord.save();

      const matchId = gamerecord._id.toString();

      console.log(`1v1 match grouped: matchId=${matchId}, X=${sortedPlayers[0].userId} (${sortedPlayers[0].username}), O=${sortedPlayers[1].userId} (${sortedPlayers[1].username})`);

      sortedPlayers.forEach((player) => {
        io.to(player.userId).emit("match-found", {
          matchId,
          gameMode: gamemode,
          region,
          players: sortedPlayers.map((p) => ({
            userId: p.userId,
            username: p.username,
            mmr: p.mmr,
          })),
          gameState: null
        });
      });

    } else if (gamemode === '4v4') {
      // 4v4: 8 players, split into 2 balanced teams of 4
      await User.updateMany(
        { _id: { $in: playerdbids } },
        { status: "in-game" }
      );

      // Sort players by MMR descending for balanced draft
      const sorted = [...players].sort((a, b) => b.mmr - a.mmr);

      // Snake draft for balanced teams: alternate picks
      // 1→A, 2→B, 3→B, 4→A, 5→A, 6→B, 7→B, 8→A
      const teamA = [];
      const teamB = [];
      sorted.forEach((player, i) => {
        const round = Math.floor(i / 2);
        if (round % 2 === 0) {
          // Even rounds: first pick goes to A
          if (i % 2 === 0) teamA.push(player);
          else teamB.push(player);
        } else {
          // Odd rounds: first pick goes to B
          if (i % 2 === 0) teamB.push(player);
          else teamA.push(player);
        }
      });

      const avgMmr = Math.round(
        players.reduce((sum, p) => sum + p.mmr, 0) / players.length
      );
      const teamAAvgMmr = Math.round(
        teamA.reduce((sum, p) => sum + p.mmr, 0) / teamA.length
      );
      const teamBAvgMmr = Math.round(
        teamB.reduce((sum, p) => sum + p.mmr, 0) / teamB.length
      );

      const gamerecord = new Matchhistory({
        players: players.map((player) => ({
          user: player.userId,
          mmratmatch: player.mmr
        })),
        gameMode: '4v4',
        status: 'grouped',
        teamA: teamA.map(p => p.userId),
        teamB: teamB.map(p => p.userId),
      })
      await gamerecord.save();

      const matchId = gamerecord._id.toString();

      const matchPayload = {
        matchId,
        gameMode: '4v4',
        region,
        avgMmr,
        teamA: teamA.map((p) => ({
          userId: p.userId,
          username: p.username,
          mmr: p.mmr,
          ping: p.ping,
        })),
        teamAAvgMmr,
        teamB: teamB.map((p) => ({
          userId: p.userId,
          username: p.username,
          mmr: p.mmr,
          ping: p.ping,
        })),
        teamBAvgMmr,
        players: players.map((p) => ({
          userId: p.userId,
          username: p.username,
          mmr: p.mmr,
          ping: p.ping,
        })),
      };

      players.forEach((player) => {
        io.to(player.userId).emit("match-found", matchPayload);
      });

      console.log(`4v4 match created: ${matchId} | Team A (avg ${teamAAvgMmr}): ${teamA.map(p => p.username).join(', ')} | Team B (avg ${teamBAvgMmr}): ${teamB.map(p => p.username).join(', ')}`);
    }
  },

  getFourPlayerMatch: asynchandler(async (req, res) => {
    const { matchId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid match ID format"
      });
    }

    const match = await Matchhistory.findById(matchId).populate('players.user', 'username avatar rank');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found"
      });
    }

    let activeGame = gameManager.getGame(matchId);
    if (!activeGame && match.gameMode === "1v1" && match.status === "ongoing" && match.players.length >= 2) {
      // Use stored playerX/playerO if available, otherwise fall back to players order
      const p1 = match.playerX?.toString() || match.players[0].user?._id?.toString() || match.players[0].user?.toString();
      const p2 = match.playerO?.toString() || match.players[1].user?._id?.toString() || match.players[1].user?.toString();
      if (p1 && p2) {
        activeGame = gameManager.createGame(matchId, p1, p2);
        console.log(`Recreated 1v1 game session: matchId=${matchId}, X=${p1}, O=${p2}`);
      }
    }

    // Build team arrays for 4v4 matches
    let teamAData = null;
    let teamBData = null;
    if (match.gameMode === '4v4' && match.teamA && match.teamB) {
      const allPlayerMap = {};
      match.players.forEach(p => {
        const uid = p.user?._id?.toString() || p.user?.toString();
        allPlayerMap[uid] = {
          userId: uid,
          username: p.user?.username || "Operative",
          avatar: p.user?.avatar || "",
          rank: p.user?.rank || "Unranked",
          mmrAtMatch: p.mmratmatch,
        };
      });
      teamAData = match.teamA.map(id => allPlayerMap[id.toString()] || { userId: id.toString() });
      teamBData = match.teamB.map(id => allPlayerMap[id.toString()] || { userId: id.toString() });
    }

    return res.status(200).json({
      success: true,
      data: {
        matchId: match._id.toString(),
        gameMode: match.gameMode,
        status: activeGame ? activeGame.status : match.status,
        players: match.players.map((p) => ({
          userId: p.user?._id?.toString() || p.user?.toString() || "Unknown",
          username: p.user?.username || "Operative",
          avatar: p.user?.avatar || "",
          rank: p.user?.rank || "Unranked",
          mmrAtMatch: p.mmratmatch,
        })),
        teamA: teamAData,
        teamB: teamBData,
        gameState: activeGame || null,
        result: match.result || null,
        createdAt: match.createdAt,
      },
    });
  }),

  getUserFourPlayerMatches: asynchandler(async (req, res) => {
    const userId = req.user._id;

    const matches = await Matchhistory.find({
      'players.user': userId
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('players.user', 'username avatar rank');

    return res.status(200).json({
      success: true,
      data: matches.map((match) => ({
        matchId: match._id.toString(),
        gameMode: match.gameMode,
        status: match.status,
        players: match.players.map((p) => ({
          userId: p.user?._id?.toString() || p.user?.toString() || "Unknown",
          username: p.user?.username || "Operative",
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

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid match ID format"
      });
    }

    const match = await Matchhistory.findById(matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found"
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
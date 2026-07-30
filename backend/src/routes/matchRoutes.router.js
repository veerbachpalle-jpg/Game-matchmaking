import { Router } from "express";
import { matchmaker } from "../Matchfunction/matchmaker";

const router = Router();

// GET /match/four-player/:matchId — Get a specific four-player match
router.route("/four-player/:matchId").get(matchmaker.getFourPlayerMatch);

// GET /match/four-player — Get current user's four-player match history (needs auth)
router.route("/four-player").get(matchmaker.getUserFourPlayerMatches);

// POST /match/four-player/:matchId/result — Submit result for a four-player match
router.route("/four-player/:matchId/result").post(matchmaker.submitFourPlayerResult);

export default router;

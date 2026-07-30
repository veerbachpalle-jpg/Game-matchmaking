import { Router } from "express";
import { matchmaker } from "../Matchfunction/matchmaker";
import { verifyJWT, verifyAdmin } from "../middlewares/auth";

const router = Router();

router.route("/four-player/:matchId").get(verifyJWT, matchmaker.getFourPlayerMatch);
router.route("/four-player").get(verifyJWT, matchmaker.getUserFourPlayerMatches);
router.route("/four-player/:matchId/result").post(verifyJWT, verifyAdmin, matchmaker.submitFourPlayerResult);

export default router;

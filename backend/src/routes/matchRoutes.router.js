import { Router } from "express";
import { matchmaker } from "../Matchfunction/matchmaker.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.js";

const router = Router();

router.route("/active").get(verifyJWT, verifyAdmin, matchmaker.adminGetActiveMatches);
router.route("/four-player/:matchId").get(verifyJWT, matchmaker.getFourPlayerMatch);
router.route("/four-player").get(verifyJWT, matchmaker.getUserFourPlayerMatches);
router.route("/four-player/:matchId/result").post(verifyJWT, verifyAdmin, matchmaker.submitFourPlayerResult);

export default router;

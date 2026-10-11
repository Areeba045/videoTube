import { Router } from "express";
import { verifyJwt } from "../middelware/auth.middelware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();
router
  .route("/c/:channelId")
  .get(getUserChannelSubscribers)
  .post(verifyJwt, toggleSubscription);

router.route("/subscribed").get(verifyJwt, getSubscribedChannels);

export default router;

import { Router } from "express";
import { verifyJwt } from "../middelware/auth.middelware.js";
import {
  toggleVideoLike,
  toggleCommentLike,
  getLikedvideos,
} from "../controllers/like.controller.js";

const router = Router();

router.route("/toggle/v/:videoId").post(verifyJwt, toggleVideoLike);

router.route("/toggle/c/:commentId").post(verifyJwt, toggleCommentLike);

router.route("/videos").get(verifyJwt, getLikedvideos);

export default router;

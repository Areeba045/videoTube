import { Router } from "express";
import {
  clearWatchHistory,
  removeFromWatchHistory,
  addToWatchHistory,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  registerUser,
  updateAccountDetails,
  updateCoverImage,
  updateUserAvatar,
  changePassword,
} from "../controllers/user.controller.js";
import { upload } from "../middelware/multter.middelware.js";
import { verifyJwt } from "../middelware/auth.middelware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJwt, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJwt, changePassword);

router.route("/current-user").get(verifyJwt, getCurrentUser);

router.route("/update-account").patch(verifyJwt, updateAccountDetails);

router
  .route("/avatar")
  .patch(verifyJwt, upload.single("avatar"), updateUserAvatar);

router
  .route("/cover-Image")
  .patch(verifyJwt, upload.single("coverImage"), updateCoverImage);

router.route("/c/:channelId").get(verifyJwt, getUserChannelProfile);

router.route("/history").get(verifyJwt, getWatchHistory);

router.route("/history").delete(verifyJwt, clearWatchHistory);

router
  .route("/history/entry/:historyId")
  .delete(verifyJwt, removeFromWatchHistory);
router.route("/history/:videoId").post(verifyJwt, addToWatchHistory);

export default router;

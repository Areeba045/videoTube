import {
  updateVideos,
  uploadVideos,
  getAllVideos,
  getVideoById,
  deleteVideos,
  searchVideos,
  togglePublishStatus,
  getMyVideos,
} from "../controllers/video.controller.js";

import { Router } from "express";
import { verifyJwt } from "../middelware/auth.middelware.js";
import { upload } from "../middelware/multter.middelware.js";
import { optionalVerifyJwt } from "../middelware/optionalVerifyJwt.js";

const router = Router();

router.route("/upload").post(
  verifyJwt,
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "video",
      maxCount: 1,
    },
  ]),
  uploadVideos
);

router.route("/all").get(getAllVideos);

router.route("/c/:search").get(searchVideos);

router.route("/my-videos").get(verifyJwt, getMyVideos);

router
  .route("/toggle/published/:videoId")
  .patch(verifyJwt, togglePublishStatus);

router
  .route("/:videoId")
  .get(optionalVerifyJwt, getVideoById)
  .delete(verifyJwt, deleteVideos);

router.route("/:videoId").patch(
  verifyJwt,
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "video",
      maxCount: 1,
    },
  ]),
  updateVideos
);

export default router;

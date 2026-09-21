import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comments.model.js";
import { Tweet } from "../models/tweets.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { VideoId } = req.params;
  //TODO : TOGGLE LIKE ON VIDEOS / DISLIKE
  const { type } = req.body;

  if (!isValidObjectId(VideoId)) {
    throw new ApiError(400, "This Video ID is not validate !");
  }

  if (!["like", "dislike"].includes(type)) {
    throw new ApiError(400, "Invalid reaction type");
  }

  const video = await Video.findById(VideoId);

  if (!video) {
    throw new ApiError(404, "Video not found !");
  }

  const existingReaction = await Like.findOne({
    video: VideoId,
    likedBy: req.user._id,
  });

  if (existingReaction) {
    if (existingReaction.reactionType === type) {
      await Like.deleteOne({
        _id: existingReaction._id,
      });

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { reaction: null },
            "Reaction Removed Successfully !"
          )
        );
    } else {
      existingReaction.reactionType = type;

      await existingReaction.save();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { reaction: existingReaction.reactionType },
            "Reaction Update Successfully "
          )
        );
    }
  } else {
    const newReaction = await Like.create({
      video: VideoId,
      likedBy: req.user._id,
      reactionType: type,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { reaction: newReaction.reactionType },
          "Reaction Added Successfully "
        )
      );
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  //TODO : TOGGLE LIKE ON COMMENTS
  const { commentId } = req.params;
  const type = req.body.type;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "This Comment ID is not valid ");
  }
  if (!["like", "dislike"].includes(type)) {
    throw new ApiError(400, "Invalidreaction type");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found ");
  }

  const existingCommentReaction = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingCommentReaction) {
    if (existingCommentReaction.reactionType === type ) {
      await Like.deleteOne({
        _id: existingCommentReaction._id,
      });

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { reaction: null },
            "Comment reaction Removed Successfully "
          )
        );
    } else {
      existingCommentReaction.reactionType = type;

      await existingCommentReaction.save();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { reaction: existingCommentReaction.reactionType },
            "Comment Reaction update Successfully "
          )
        );
    }
  }else {
    const newCommentReaction = await Like.create({
        likedBy : req.user._id,
        comment : commentId ,
        reactionType : type ,
    })

    return res.status(200).json(new ApiResponse(200, newCommentReaction , "Comment Reaction Added successfully "))
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO : TOGGLE LIKE ON TWEET
});

const getLikedvideos = asyncHandler(async (req, res) => {
  //TODO : GET ALL LIKED VIDEOS
  const userId = req.user._id;

  const likedvideos = await Like.find({
    likedBy: userId,
    reactionType: "like",
  }).populate("video");

  if (likedvideos.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, [], "you arenot Liked any videos "));
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, likedvideos, "Liked Video fetched successfully !")
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedvideos };

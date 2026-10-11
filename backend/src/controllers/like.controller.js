import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comments.model.js";
import { Tweet } from "../models/tweets.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO : TOGGLE LIKE ON VIDEOS / DISLIKE
  const { type } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "This Video ID is not validate !");
  }

  if (!["like", "dislike"].includes(type)) {
    throw new ApiError(400, "Invalid reaction type");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found !");
  }

  const existingReaction = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  let reaction = null;

  if (existingReaction) {
    // Same reaction clicked again → remove it
    if (existingReaction.reactionType === type) {
      await Like.deleteOne({
        _id: existingReaction._id,
      });
    } else {
      // Like → dislike OR dislike → like
      existingReaction.reactionType = type;

      await existingReaction.save();

      reaction = existingReaction.reactionType;
    }
  } else {
    // first reaction
    const newReaction = await Like.create({
      video: videoId,
      likedBy: req.user._id,
      reactionType: type,
    });

    reaction = newReaction.reactionType;
  }

  const likeCount = await Like.countDocuments({
    video: videoId,
    reactionType: "like",
  });

  const dislikeCount = await Like.countDocuments({
    video: videoId,
    reactionType: "dislike",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { reaction, likeCount, dislikeCount },
        "Reaction Added Successfully "
      )
    );
});

// const toggleCommentLike = asyncHandler(async (req, res) => {
//   //TODO : TOGGLE LIKE ON COMMENTS
//   const { commentId } = req.params;
//   const type = req.body.type;

//   if (!isValidObjectId(commentId)) {
//     throw new ApiError(400, "This Comment ID is not valid ");
//   }
//   if (!["like", "dislike"].includes(type)) {
//     throw new ApiError(400, "Invalid  reaction type");
//   }

//   const comment = await Comment.findById(commentId);

//   if (!comment) {
//     throw new ApiError(404, "Comment not found ");
//   }

//   const existingCommentReaction = await Like.findOne({
//     comment: commentId,
//     likedBy: req.user._id,
//   });

//   if (existingCommentReaction) {
//     if (existingCommentReaction.reactionType === type) {
//       await Like.deleteOne({
//         _id: existingCommentReaction._id,
//       });

//       return res
//         .status(200)
//         .json(
//           new ApiResponse(
//             200,
//             { reaction: null },
//             "Comment reaction Removed Successfully "
//           )
//         );
//     } else {
//       existingCommentReaction.reactionType = type;

//       await existingCommentReaction.save();

//       return res
//         .status(200)
//         .json(
//           new ApiResponse(
//             200,
//             { reaction: existingCommentReaction.reactionType },
//             "Comment Reaction update Successfully "
//           )
//         );
//     }
//   } else {
//     const newCommentReaction = await Like.create({
//       likedBy: req.user._id,
//       comment: commentId,
//       reactionType: type,
//     });

//     return res
//       .status(200)
//       .json(
//         new ApiResponse(
//           200,
//           newCommentReaction,
//           "Comment Reaction Added successfully "
//         )
//       );
//   }
// });

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { type } = req.body;
  const userId = req.user._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment ID is not valid");
  }

  if (!["like", "dislike"].includes(type)) {
    throw new ApiError(400, "Invalid reaction type");
  }

  // Works for a top-level comment, a reply, or a reply to a reply.
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Find this user's reaction on this exact comment/reply.
  const existingReaction = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  let reaction = type;

  if (existingReaction) {
    if (existingReaction.reactionType === type) {
      // Clicking the same reaction again removes it.
      await Like.deleteOne({ _id: existingReaction._id });
      reaction = null;
    } else {
      // Switch like to dislike, or dislike to like.
      existingReaction.reactionType = type;
      await existingReaction.save();
    }
  } else {
    await Like.create({
      comment: commentId,
      likedBy: userId,
      reactionType: type,
    });
  }

  // Counts belong to this specific comment/reply.
  const [likeCount, dislikeCount] = await Promise.all([
    Like.countDocuments({
      comment: commentId,
      reactionType: "like",
    }),
    Like.countDocuments({
      comment: commentId,
      reactionType: "dislike",
    }),
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { reaction, likeCount, dislikeCount },
        "Comment reaction updated successfully"
      )
    );
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
      .status(200)
      .json(new ApiResponse(200, [], "you arenot Liked any videos "));
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, likedvideos, "Liked Video fetched successfully !")
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedvideos };

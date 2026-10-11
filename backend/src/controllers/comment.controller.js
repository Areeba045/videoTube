import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comments.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";

// const getVideoComment = asyncHandler(async (req, res) => {
//   // TODO : GET ALL COMMENT FOR A VIDEO
//   const { videoId } = req.params;
//   const { page = 1, limit = 10 } = req.query;

//   if (!isValidObjectId(videoId)) {
//     throw new ApiError(400, "Invalid VideoID");
//   }

//   const currentUserId = req.user?._id
//   ? new mongoose.Types.ObjectId(req.user._id)
//   : null;
//   const videoComments = await Comment.aggregate([
//     {
//       $match: {
//         video: new mongoose.Types.ObjectId(videoId),
//         parentComment: null,
//       },
//     },
//     {
//       $lookup: {
//         from: "users",
//         localField: "owner",
//         foreignField: "_id",
//         as: "owner",
//       },
//     },
//     {
//       $unwind: "$owner",
//     },

//     // {
//     //   $lookup: {
//     //     from: "comments",
//     //     let: { parentId: "$_id" },
//     //     pipeline: [
//     //       {
//     //         $match: {
//     //           $expr: {
//     //             $eq: ["$parentComment", "$$parentId"],
//     //           },
//     //         },
//     //       },
//     //       {
//     //         $lookup: {
//     //           from: "users",
//     //           localField: "owner",
//     //           foreignField: "_id",
//     //           as: "owner",
//     //         },
//     //       },
//     //       {
//     //         $unwind: {
//     //           path: "$owner",
//     //           preserveNullAndEmptyArrays: true,
//     //         },
//     //       },
//     //       {
//     //         $project: {
//     //           _id: 1,
//     //           content: 1,
//     //           video: 1,
//     //           parentComment: 1,
//     //           createdAt: 1,
//     //           owner: {
//     //             _id: 1,
//     //             fullname: 1,
//     //             fullName: 1,
//     //             username: 1,
//     //             avatar: 1,
//     //           },
//     //         },
//     //       },
//     //       { $sort: { createdAt: 1 } },
//     //     ],
//     //     as: "replies",
//     //   },
//     // },

// {
//   $lookup: {
//     from: "comments",
//     let: { parentId: "$_id" },
//     pipeline: [
//       {
//         $match: {
//           $expr: {
//             $eq: ["$parentComment", "$$parentId"],
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "owner",
//           foreignField: "_id",
//           as: "owner",
//         },
//       },
//       {
//         $unwind: {
//           path: "$owner",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "likes",
//           localField: "_id",
//           foreignField: "comment",
//           as: "commentReaction",
//         },
//       },
//       {
//         $addFields: {
//           likesCount: {
//             $size: {
//               $filter: {
//                 input: "$commentReaction",
//                 as: "reaction",
//                 cond: {
//                   $eq: ["$$reaction.reactionType", "like"],
//                 },
//               },
//             },
//           },
//           dislikeCount: {
//             $size: {
//               $filter: {
//                 input: "$commentReaction",
//                 as: "reaction",
//                 cond: {
//                   $eq: ["$$reaction.reactionType", "dislike"],
//                 },
//               },
//             },
//           },
//           // userReaction: {
//           //   $let: {
//           //     vars: {
//           //       myReaction: {
//           //         $filter: {
//           //           input: "$commentReaction",
//           //           as: "reaction",
//           //           cond: {
//           //             $eq: [
//           //               "$$reaction.likedBy",
//           //               new mongoose.Types.ObjectId(req.user._id),
//           //             ],
//           //           },
//           //         },
//           //       },
//           //     },
//           //     in: {
//           //       $ifNull: [
//           //         {
//           //           $arrayElemAt: [
//           //             "$$myReaction.reactionType",
//           //             0,
//           //           ],
//           //         },
//           //         null,
//           //       ],
//           //     },
//           //   },
//           // },
//           userReaction: currentUserId
//   ? {
//       $let: {
//         vars: {
//           myReaction: {
//             $filter: {
//               input: "$commentReaction",
//               as: "reaction",
//               cond: {
//                 $eq: [
//                   "$$reaction.likedBy",
//                   currentUserId,
//                 ],
//               },
//             },
//           },
//         },
//         in: {
//           $ifNull: [
//             {
//               $arrayElemAt: [
//                 "$$myReaction.reactionType",
//                 0,
//               ],
//             },
//             null,
//           ],
//         },
//       },
//     }
//   : null,
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           content: 1,
//           video: 1,
//           parentComment: 1,
//           createdAt: 1,
//           likesCount: 1,
//           dislikeCount: 1,
//           userReaction: 1,
//           owner: {
//             _id: 1,
//             fullname: 1,
//             fullName: 1,
//             username: 1,
//             avatar: 1,
//           },
//         },
//       },
//       {
//         $sort: {
//           createdAt: 1,
//         },
//       },
//     ],
//     as: "replies",
//   },
// },

//     {
//       $lookup: {
//         from: "likes",
//         localField: "_id",
//         foreignField: "comment",
//         as: "commentReaction",
//       },
//     },
//     // {
//     //   $addFields: {
//     //     likesCount: {
//     //       $size: {
//     //         $filter: {
//     //           input: "$commentReaction",
//     //           as: "reaction",
//     //           cond: {
//     //             $eq: ["$$reaction.reactionType", "like"],
//     //           },
//     //         },
//     //       },
//     //     },
//     //   },
//     // },

// {
//   $addFields: {
//     likesCount: {
//       $size: {
//         $filter: {
//           input: "$commentReaction",
//           as: "reaction",
//           cond: {
//             $eq: ["$$reaction.reactionType", "like"],
//           },
//         },
//       },
//     },
//     dislikeCount: {
//       $size: {
//         $filter: {
//           input: "$commentReaction",
//           as: "reaction",
//           cond: {
//             $eq: ["$$reaction.reactionType", "dislike"],
//           },
//         },
//       },
//     },
//     // userReaction: {
//     //   $let: {
//     //     vars: {
//     //       myReaction: {
//     //         $filter: {
//     //           input: "$commentReaction",
//     //           as: "reaction",
//     //           cond: {
//     //             $eq: [
//     //               "$$reaction.likedBy",
//     //               new mongoose.Types.ObjectId(req.user._id),
//     //             ],
//     //           },
//     //         },
//     //       },
//     //     },
//     //     in: {
//     //       $ifNull: [
//     //         {
//     //           $arrayElemAt: [
//     //             "$$myReaction.reactionType",
//     //             0,
//     //           ],
//     //         },
//     //         null,
//     //       ],
//     //     },
//     //   },
//     // },
//     userReaction: currentUserId
//   ? {
//       $let: {
//         vars: {
//           myReaction: {
//             $filter: {
//               input: "$commentReaction",
//               as: "reaction",
//               cond: {
//                 $eq: [
//                   "$$reaction.likedBy",
//                   currentUserId,
//                 ],
//               },
//             },
//           },
//         },
//         in: {
//           $ifNull: [
//             {
//               $arrayElemAt: [
//                 "$$myReaction.reactionType",
//                 0,
//               ],
//             },
//             null,
//           ],
//         },
//       },
//     }
//   : null,
//   },
// },

//     {
//       $sort: {
//         createdAt: -1,
//       },
//     },
//     {
//       $skip: (Number(page) - 1) * Number(limit),
//     },
//     {
//       $limit: Number(limit),
//     },
//     {
//       $project: {
//         _id: 1,
//         content: 1,
//         createdAt: 1,
//         likesCount: 1,
//         dislikeCount: 1,
//         userReaction:1 ,
//         commentReaction: 1,
//         replies: 1,
//         owner: {
//           _id: 1,
//           fullName: 1,
//           fullname: 1,
//           avatar: 1,
//           username: 1,
//         },
//       },
//     },
//   ]);

//   if (!videoComments) {
//     throw new ApiError(404, "Comments could not be Loaded ");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, videoComments, "Get Video All comments "));
// });

const getVideoComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid VideoID");
  }

  const currentUserId = req.user?._id?.toString();

  // Get only top-level comments for pagination.
  const topComments = await Comment.find({
    video: videoId,
    parentComment: null,
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("owner", "fullname fullName username avatar")
    .lean();

  // Get every reply, including replies to replies.
  const allReplies = await Comment.find({
    video: videoId,
    parentComment: { $ne: null },
  })
    .sort({ createdAt: 1 })
    .populate("owner", "fullname fullName username avatar")
    .lean();

  const allComments = [...topComments, ...allReplies];
  const commentIds = allComments.map((comment) => comment._id);

  // Fetch reactions for all comments and replies in one query.
  const reactions = await Like.find({
    comment: { $in: commentIds },
  }).lean();

  const reactionMap = new Map();

  for (const reaction of reactions) {
    const id = reaction.comment.toString();

    if (!reactionMap.has(id)) {
      reactionMap.set(id, []);
    }

    reactionMap.get(id).push(reaction);
  }

  // Prepare every comment as a node.
  const nodeMap = new Map();

  for (const comment of allComments) {
    const id = comment._id.toString();
    const commentReactions = reactionMap.get(id) || [];

    nodeMap.set(id, {
      _id: comment._id,
      content: comment.content,
      video: comment.video,
      parentComment: comment.parentComment,
      createdAt: comment.createdAt,
      owner: comment.owner,
      likesCount: commentReactions.filter((r) => r.reactionType === "like")
        .length,
      dislikeCount: commentReactions.filter((r) => r.reactionType === "dislike")
        .length,
      userReaction:
        commentReactions.find((r) => r.likedBy.toString() === currentUserId)
          ?.reactionType ?? null,
      replies: [],
    });
  }

  // Attach each reply to its parent, at any nesting depth.
  for (const comment of allComments) {
    if (!comment.parentComment) continue;

    const parentId = comment.parentComment.toString();
    const parent = nodeMap.get(parentId);
    const node = nodeMap.get(comment._id.toString());

    if (parent && node) {
      parent.replies.push(node);
    }
  }

  // Return only top-level comments; replies are nested inside them.
  const result = topComments.map((comment) =>
    nodeMap.get(comment._id.toString())
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Comments loaded successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO : ADD A COMMENT TO A VIDEO
  const { videoId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid VideoID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content must not be empty!");
  }

  const comment = await Comment.create({
    video: videoId,
    content,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(400, "There was a problem commenting on the video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment Successfully posted !"));
});

const addReply = asyncHandler(async (req, res) => {
  const { videoId, commentId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(videoId) || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid video or comment ID");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Reply cannot be empty");
  }

  const parentComment = await Comment.findOne({
    _id: commentId,
    video: videoId,
  });

  if (!parentComment) {
    throw new ApiError(404, "Parent comment not found");
  }

  const reply = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: req.user._id,
    parentComment: parentComment._id,
  });
  const populatedReply = await Comment.findById(reply._id).populate(
    "owner",
    "fullname fullName username avatar"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populatedReply, "Reply added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO : UPDATE A COMMENT
  const { commentId } = req.params;
  const { newContent } = req.body;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment ID is not valid");
  }

  if (!newContent?.trim()) {
    throw new ApiError(400, "Comment can not be empty !");
  }

  const comment = await Comment.findOneAndUpdate(
    {
      _id: commentId,
      owner: req.user._id,
    },
    {
      content: newContent,
    },
    {
      returnDocument: "after",
    }
  );
  if (!comment) {
    throw new ApiError(404, "Comment NOT EXISTS!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment Update successfully "));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO : DELETE A COMMENT
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment ID is not valid");
  }

  const comment = await Comment.findOne({
    _id: commentId,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const descendants = await Comment.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(commentId),
      },
    },
    {
      $graphLookup: {
        from: "comments",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parentComment",
        as: "descendants",
      },
    },
  ]);

  const idsToDelete = [
    comment._id,
    ...(descendants[0]?.descendants ?? []).map((item) => item._id),
  ];

  await Comment.deleteMany({
    _id: { $in: idsToDelete },
  });

  await Like.deleteMany({
    comment: { $in: idsToDelete },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Comment and its replies deleted successfully")
    );
});

export { getVideoComment, addReply, addComment, updateComment, deleteComment };

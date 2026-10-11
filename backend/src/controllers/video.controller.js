import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comments.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const uploadVideos = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;
  //TODO :  GET VIDEO , UPLOADON CLOUDINARY , CREATE VIDEO

  // get videos details from frontend
  // validation - not empty
  // check for images , check for avater
  // upload them to cloudinary , avatar
  // create video object - create entry in db
  // check for video creation
  // return response

  console.log("========== VIDEO UPLOAD ==========");
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);
  console.log("USER:", req.user);

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "All Fields are required !");
  }

  const thumbnailLocalPath = req.files?.thumbnail?.[0].path;
  const videoLocalPath = req.files?.video?.[0].path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail are required !");
  }

  if (!videoLocalPath) {
    throw new ApiError(400, "video filed are required !");
  }
  // HASSAN TODO: In dono ko sath upload krna he.
  // use camelCase everywhere.
  const uploadedthumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  const uploadedvideo = await uploadOnCloudinary(videoLocalPath);

  if (!uploadedthumbnail) {
    throw new ApiError(400, "Thumbnail is not uploaded !");
  }
  if (!uploadedvideo) {
    throw new ApiError(400, "Video is not uploaded !");
  }

  const publishedStatus = isPublished === "true";

  const video = await Video.create({
    title,
    description,
    thumbnail: uploadedthumbnail.url,
    video: uploadedvideo.url,
    owner: req.user?._id,
    duration: uploadedvideo.duration,
    videoPublicId: uploadedvideo.public_id,
    thumbnailPublicId: uploadedthumbnail.public_id,
    isPublished: publishedStatus,
  });

  if (!video) {
    throw new ApiError(400, "There was a problem for uploading  video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video is uploaded Successfully"));
});

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy, sortType } = req.query;

  //TODO : get all videos based on query , sort , pagination

  const allVideos = await Video.aggregate([
    {
      $match: {
        isPublished: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    // newest videos first
    {
      $sort: {
        createdAt: -1,
        // [sortBy]: sortType === "asc" ? 1 : -1,
      },
    }, //pagination
    {
      $skip: (Number(page) - 1) * Number(limit),
    }, // limit
    {
      $limit: Number(limit),
    },
    {
      $project: {
        title: 1,
        video: 1,
        description: 1,
        isPublished: 1,
        duration: 1,
        thumbnail: 1,
        createdAt: 1,
        views: 1,
        owner: {
          _id: 1,
          username: 1,
          fullName: 1,
          avatar: 1,
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, allVideos, "Videos fetched successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO : GET VIDEO BY ID

  const currentUserId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null ;

  if (!isValidObjectId(videoId)) {
    throw new Api(400, "This videoId is not exists");
  }

  // const findVideo = await Video.findById(videoId);

  // if(!findVideo){
  //     throw new ApiError(400 , "video not found ");
  // }

  const updateVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: { views: 1 },
    },
    { returnDocument: "after" }
  );

  if (!updateVideo) {
    throw new ApiError(400, "Video not found");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner._id",
        foreignField: "channel",
        as: "subscriber",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscriber",
        },
        commentsCount: {
          $size: "$comments",
        },
        isSubscribed : {
          $cond : {
            if : { $eq : [currentUserId , null]} ,
            then :  false ,
            else : {
              $in : [currentUserId , "$subscriber.subscriber"]
            }
          }
        } ,
        likesCount: {
          $size: {
            $filter: {
              input: "$likes",
              as: "like",
              cond: {
                $eq: ["$$like.reactionType", "like"],
              },
            },
          },
        },
        dislikeCount: {
          $size: {
            $filter: {
              input: "$likes",
              as: "like",
              cond: {
                $eq: ["$$like.reactionType", "dislike"],
              },
            },
          },
        },
        currentUserReaction: {
          $let: {
            vars: {
              userReaction: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$likes",
                      as: "like",
                      cond: {
                        $eq: ["$$like.likedBy", currentUserId],
                      },
                    },
                  },

                  0,
                ],
              },
            },

            in: {
              $ifNull: ["$$userReaction.reactionType", null],
            },
          },
        },
      },
    },
    {
      $project: {
        video: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        createdAt: 1,
        comments: 1,
        isPublished: 1,

        owner: {
          _id: 1,
          username: 1,
          avatar: 1,
          fullName: 1,
        },

        likesCount: 1,
        commentsCount: 1,
        subscriberCount: 1,
        currentUserReaction: 1,
        dislikeCount: 1,
        isSubscribed : 1 , 
      },
    },
  ]);
  if (!video.length) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successFully !"));
});

const updateVideos = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // TODO : UPDATE VIDEO DETAILS  LIKE TITLE , DISCRIPTION , THUMBNAIL ETC
  const { title, description } = req.body;
  const updateVideofile = req.files?.video?.[0]?.path;
  const updateThumbnailfile = req.files?.thumbnail?.[0]?.path;
  const updateData = {};

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "this videoID is not exists ");
  }

  const findVideo = await Video.findById(videoId);

  if (!findVideo) {
    throw new ApiError(400, "Video not found ");
  }

  if (!findVideo.owner.equals(req.user?._id)) {
    throw new ApiError(
      400,
      "you are not video owner , your not update the video "
    );
  }

  if (title !== undefined) {
    if (title.trim() === "") {
      throw new ApiError(400, "Title is empty not Allowed");
    }
    updateData.title = title;
  }
  if (description !== undefined) {
    updateData.description = description;
  }

  if (updateVideofile !== undefined) {
    const updatevideo = await uploadOnCloudinary(updateVideofile);

    if (!updatevideo) {
      throw new ApiError(400, "Error uploading on updating video");
    }

    updateData.video = updatevideo.url;
    updateData.duration = updatevideo.duration;
    updateData.videoPublicId = updatevideo.public_id;
  }

  if (updateThumbnailfile !== undefined) {
    const updateThumbnail = await uploadOnCloudinary(updateThumbnailfile);

    if (!updateThumbnail) {
      throw new ApiError(400, "Error while uploading thumbnail");
    }

    updateData.thumbnail = updateThumbnail.url;
    updateData.thumbnailPublicId = updateThumbnail.public_id;
  }

  const update = await Video.findByIdAndUpdate(videoId, updateData, {
    returnDocument: "after",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, update, "your video was update successfully "));
});

const deleteVideos = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO : DELETE VIDEOS

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "this videoID is not exists ");
  }

  const findVideo = await Video.findById(videoId);

  if (!findVideo) {
    throw new ApiError(400, "Video not found ");
  }

  if (!findVideo.owner.equals(req.user?._id)) {
    throw new ApiError(
      403,
      "your are not video owner , your not update the video "
    );
  }

  await deleteFromCloudinary(findVideo.videoPublicId);
  await deleteFromCloudinary(findVideo.thumbnailPublicId);

  await Video.findByIdAndDelete(videoId);
  await Like.deleteMany({
    video: videoId,
  });
  await Comment.deleteMany({
    video: videoId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully !"));
});

const searchVideos = asyncHandler(async (req, res) => {
  const { search } = req.params;

  if (!search?.trim()) {
    throw new ApiError(400, "Your Search not exists ");
  }

  const videos = await Video.aggregate([
    {
      $match: {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $project: {
        title: 1,
        duration: 1,
        views: 1,
        thumbnail: 1,
        createdAt: 1,

        owner: {
          fullName: 1,
          avatar: 1,
          username: 1,
        },
      },
    },
  ]);

  if (!videos) {
    throw new ApiError(404, "Video not Found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, videos, "your Search video Found successfully ")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, " Invalid Video ID ");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (!video.owner.equals(req.user?._id)) {
    throw new ApiError(403, "You are not the owner");
  }
  video.isPublished = !video.isPublished;

  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        video.isPublished
          ? "Video Published Successfully"
          : " video unpublished successfully"
      )
    );
});

const getMyVideos = asyncHandler(async (req, res) => {
  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },

    {
      $unwind: "$owner",
    },

    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        thumbnail: 1,
        video: 1,
        duration: 1,
        views: 1,
        createdAt: 1,
        isPublished: 1,

        owner: {
          _id: 1,
          fullName: 1,
          username: 1,
          avatar: 1,
          coverImage: 1,
        },
      },
    },

    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "My videos fetched successfully"));
});
export {
  updateVideos,
  uploadVideos,
  getAllVideos,
  getVideoById,
  deleteVideos,
  searchVideos,
  togglePublishStatus,
  getMyVideos,
};

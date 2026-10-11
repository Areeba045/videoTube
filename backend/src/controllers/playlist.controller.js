import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createPlaylist = asyncHandler(async (req, res) => {

  const { name, description } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Playlist name is required");
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    description,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        playlist,
        "Playlist created successfully"
      )
    );
});



const getUserPlaylist = asyncHandler(async (req, res) => {

  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User ID");
  }

  const playlists = await Playlist.find({
    owner: userId,
  })
    .populate("owner")
    .populate("videos");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlists,
        "User playlists fetched successfully"
      )
    );
});


const getPlaylistById = asyncHandler(async (req, res) => {

  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid Playlist ID");
  }

  const playlist = await Playlist.findById(playlistId)
    .populate("owner")
    .populate("videos");

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Playlist fetched successfully"
      )
    );
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {

  const { playlistId, videoId } = req.params;


  if (
    !isValidObjectId(playlistId) ||
    !isValidObjectId(videoId)
  ) {
    throw new ApiError(
      400,
      "Invalid Playlist ID or Video ID"
    );
  }


  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  const playlist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: req.user._id,
    },
    {
      $addToSet: {
        videos: videoId,
      },
    },
    {
      returnDocument : "after",
    }
  );

  if (!playlist) {
    throw new ApiError(
      404,
      "Playlist not found or you are not the owner"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Video added to playlist successfully"
      )
    );
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

  const { playlistId, videoId } = req.params;


  if (
    !isValidObjectId(playlistId) ||
    !isValidObjectId(videoId)
  ) {
    throw new ApiError(
      400,
      "Invalid Playlist ID or Video ID"
    );
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }


  const playlist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: req.user._id,
    },
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      returnDocument : "after"
    }
  );

  if (!playlist) {
    throw new ApiError(
      404,
      "Playlist not found or you are not the owner"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Video removed from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {

  const { playlistId } = req.params;


  if (!isValidObjectId(playlistId)) {
    throw new ApiError(
      400,
      "Invalid Playlist ID"
    );
  }

  const playlist = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(
      404,
      "Playlist not found or you are not the owner"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Playlist deleted successfully"
      )
    );
});


const updatePlaylist = asyncHandler(async (req, res) => {

  const { playlistId } = req.params;

  const { name, description } = req.body;


  if (!isValidObjectId(playlistId)) {
    throw new ApiError(
      400,
      "Invalid Playlist ID"
    );
  }

  if (
    name === undefined &&
    description === undefined
  ) {
    throw new ApiError(
      400,
      "Nothing to update"
    );
  }


  const updateData = {};

  if (name !== undefined) {

    if (!name.trim()) {
      throw new ApiError(
        400,
        "Playlist name cannot be empty"
      );
    }

    updateData.name = name.trim();
  }

  if (description !== undefined) {
    updateData.description = description;
  }

  const playlist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: req.user._id,
    },
    {
      $set: updateData,
    },
    {
      returnDocument : "after",
      runValidators: true,
    }
  );

  if (!playlist) {
    throw new ApiError(
      404,
      "Playlist not found or you are not the owner"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Playlist updated successfully"
      )
    );
});


export {
  createPlaylist,
  getUserPlaylist,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
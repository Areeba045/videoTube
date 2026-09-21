import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { populate } from "dotenv";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  //TODO : TOGGLE SUBSCRIPTION

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel Not Found");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existingSubscription) {
    await Subscription.deleteOne({
      _id: existingSubscription._id,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isSubscribed: false,
        },
        "UnSubscribed"
      )
    );
  } else {
    const subscription = await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isSubscribed: true,
        },
        "Subscribe"
      )
    );
  }
});

// controller  to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400 , "Invalid Channel ID ");
  }

  const Subscriber = await Subscription.find({
    channel: channelId,
  }).populate("subscriber");


  return res.status(200).json(
    new ApiResponse(200 , Subscriber , "fetched All Subscriber successfully ")
  )
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
 
  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber :  new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup : {
        from : "users" ,
        localField : "channel",
        foreignField : "_id" ,
        as : "channel"
      }
    },
    {
      $unwind : "$channel"
    },
    {
      $project : {
        _id : 0 ,
        channel : {
          fullName : 1 ,
          username : 1,
          avatar : 1
        }
      }
    }
  ])

 return res.status(200).json( new ApiResponse(200 , subscribedChannels , "Fetched subscribed channels successfully "))
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };

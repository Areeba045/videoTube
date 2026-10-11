import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    //is me validation kuch mat lagao direct save kr do
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access token "
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists : username & email
  // check for images , check for avater
  // upload them to cloudinary , avatar
  // create user object - create entry in db
  // remove password and refreshToken field from response
  // check for user creation
  // return response

  const { fullName, email, username, password } = req.body;
  console.log("Body data :", req.body);
  console.log("email", email);

  // check all fields are not empty
  if (
    [fullName, email, username, password].some((field) => !field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (!email.includes("@")) {
    throw new ApiError(400, "@ is required in email");
  }

  // find username or email already exists
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username is already exists");
  }

  //check user  file path from multter
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  console.log(req.files);

  //    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  //    if(!avatarLocalPath){
  //     throw new ApiError(400 , "Avatar file is required ");
  //    }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  console.log("avatar Image : ", avatar);
  console.log("coverImage", coverImage);

  if (!avatar) {
    throw new ApiError(400, "Avatar is not uploaded ");
  }

  // create user obj in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
    email,
    password,
  });

  // check user created successfully
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); // select me hum wo wo likhte hn jo hume nhi chiye

  if (!createdUser) {
    throw new ApiError(500, "Something went worng while registering the user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User is register successfully"));

  // res.status(200).json({
  //     message : "ok"
  // })
});

const loginUser = asyncHandler(async (req, res) => {
  // get data from get request
  // validation user ha
  // provide access token
  // return to login

  // req body -> data
  // username or email
  // find the user
  // password check
  // access  and refresh token
  // send cookie   (mostly token in cookies me send secure )

  const { email, username, password } = req.body;

  // if(!username || !email){
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  // Here is an alternative of above code base on logic disscuss
  //if(!(username || email)){
  // throw new ApiError(400 , username or email is required !)
  // }

  //yaha jo user ha us me unwanted fields bhi ha like empty refreshtoken password
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user doen not exist ");
  }

  //Password check k liye hum apna bycrypt ka mehod use karen ge mrg ye humne khud bnya ha tu is k liye hum user use karen ge mooogose wala User nhi karen ge ye jo db se arha ha user ye use karen ge

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credentials ");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // dobhra database se call is liye kariha ab humare pass sb fields aye gi kyun k ab hum ne refresh token ka method call kiya tha
  const loggedInUser = await User.findById(user._id).select("-password");

  console.log(loggedInUser);

  // send tokens in cookies , security purpose option
  const options = {
    httpOnly: true, // ise se by default frintend pr koi bhi modified kr leta ha  lakin  ye srf server se hoti ha in options se
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User Logged  In SuccessFully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  //logout karne k liye sb se phele hum user ki cookies wagera clear karni paren gi jo srf server se manageho sakti ha
  //ye refreshToken ko hume gayab karna hoga means reset karna pare ga jo humare model me ha

  User.findByIdAndUpdate(
    req.user._id,
    {
      // $set : {
      //     refreshToken : undefined ,
      // }
      $unset: {
        refreshToken: 1, // this remove the field from document
      },
    },
    {
      returnDocument: "after",
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh Token ");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is used or expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newrefreshToken } = generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newrefreshToken,
          },
          "Access token refreshed Successfully !"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, username, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
        username: username,
      },
    },
    { returnDocument: "after" } //update hone k bad info return hoti ha
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path; // hum isi ko same db me save kr sakte hn

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar ");
  }

  const user = await User.findByIdAndUpdate(
    req?.user._id,
    {
      $set: { avatar: avatar.url },
    },
    {
      returnDocument: "after",
    }
  ).select("-password");

  return res.status(200).json(200, user, "Avatar Iamge updated successfully");
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalpath = req.file?.path;

  if (!coverImageLocalpath) {
    throw new ApiError(400, "coverImage is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalpath);

  if (!coverImage.url) {
    throw new ApiError(401, "Error while uploading on coverImage");
  }

  const user = await User.findByIdAndUpdate(
    req?.user._id,
    {
      $set: { coverImage: coverImage.url },
    },
    {
      returnDocument: "after",
    }
  ).select("-password");

  return (res.status(200).json, user, "coverImage was updated successfully!");
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $unwind: "$watchHistory",
    },
    {
      $sort: {
        "watchHistory.watchedAt": -1,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory.video",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: "$video",
    },
    {
      $lookup: {
        from: "users",
        localField: "video.owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        "video.owner": {
          $first: "$owner",
        },
        "video.watchedAt": "$watchHistory.watchedAt",
        "video.historyId": "$watchHistory._id",
      },
    },

    {
      $replaceRoot: {
        newRoot: "$video",
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "WatchHistory fetched successfully"));
});

const removeFromWatchHistory = asyncHandler(async (req, res) => {
  const { historyId } = req.params;

  if (!mongoose.isValidObjectId(historyId)) {
    throw new ApiError(400, "Invalid history entry ID");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {
        watchHistory: {
          _id: new mongoose.Types.ObjectId(historyId),
        },
      },
    },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "History entry removed successfully"));
});

const clearWatchHistory = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: { watchHistory: [] },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Watch history cleared successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId?.trim()) {
    throw new ApiError(400, "channelId is missing");
  }

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }

  const channel = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(channelId),
      },
    },

    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },

    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },

    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },

        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },

        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },

    {
      $project: {
        fullName: 1,
        username: 1,
        isSubscribed: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

const addToWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  await User.findByIdAndUpdate(req.user._id, {
    $push: {
      watchHistory: {
        video: videoId,
        watchedAt: new Date(),
      },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video added to Watch History "));
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  getUserChannelProfile,
  getWatchHistory,
  updateCoverImage,
  addToWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory,
};

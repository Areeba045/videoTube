import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reactionType : {
      type : String ,
      enum : ["like" , "dislike"]
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
  },
  { timeStamps: true }
);

export const Like = mongoose.model("Like", likeSchema);

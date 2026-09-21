import mongoose , { isValidObjectId}  from 'mongoose';
import { Comment } from '../models/comments.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Video } from '../models/video.model.js';
import { Like } from '../models/like.model.js';



const getVideoComment = asyncHandler( async( req , res) => {
    // TODO : GET ALL COMMENT FOR A VIDEO 
    const { videoId } = req.params ;
    const { page = 1 , limit = 10 } = req.query ;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400 , "Invalid VideoID");
    }

    const videoComments = await Comment.aggregate([
        {
            $match : {
                video :  new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup : {
                from : "users" ,
                localField : "owner" ,
                foreignField : "_id" ,
                as : "owner" ,
            }
        } ,
        {
            $unwind : "$owner"
        },
        {
            $lookup : {
                from : "likes",
                localField : "_id" ,
                foreignField : "comment",
                as : "commentReaction"
            }
        } ,
        {
            $addFields : {
                likesCount : {
                    $size : {
                        $filter : {
                            input : "$commentReaction",
                            as : reaction  ,
                            cond : {
                                $eq : [
                                    "$$reaction.reactionType",
                                    "like"
                                ]
                            }
                        }
                    }
                }
            }
        },
        {
            $sort : {
                createdAt : -1
            }
        },
        {
            $skip : (Number(page) - 1) * Number(limit)
        },
        {
            $limit : Number(limit)
        },{
            $project : {
                content : 1 ,
                createdAt : 1 ,
                likesCount : 1 ,
                commentReaction : 1 ,
                owner : {
                    fullname : 1 ,
                    avatar : 1,
                    username : 1 ,

                }
            }
        }
    ]);

    if(!videoComments){
        throw new ApiError(404 , "Video not found ");
    }

    return res.status(200).json(
        new ApiResponse(200 , videoComments , "Get Video All comments ")
    )


});

const addComment = asyncHandler ( async(req, res) => {
    // TODO : ADD A COMMENT TO A VIDEO 
    const { videoId } = req.params ;
    const { content } = req.body ;

     if(!isValidObjectId(videoId)){
        throw new ApiError(400 , "Invalid VideoID");
    }

    const video = await Video.findById(videoId)
        if(!video){
        throw new ApiError(400 , "Video not found")
    }

    if(!content ||  content.trim() === ""){
        throw new ApiError(400 , "Content must not be empty!");
    }

    const comment = await Comment.create({
        video : videoId ,
        content ,
        owner : req.user._id
    })

    if(!comment){
        throw new ApiError(400, "There was a problem commenting on the video")
    }
    return res.status(200).json( new ApiResponse(200 , comment , "Comment Successfully posted !"))
});

const updateComment = asyncHandler( async( req, res) => {
    // TODO : UPDATE A COMMENT 
    const { commentId } = req.params ;
    const { newContent } = req.body ;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400 , "Comment ID is not valid");
    }

    if(!newContent?.trim()){
        throw new ApiError(400 , "Comment can not be empty !")
    }

    const comment = await Comment.findOneAndUpdate({
        _id : commentId ,
        owner : req.user._id
    }, {
        content : newContent
    } , {
        new : true 
    })
      if(!comment){
        throw new ApiError(404 , "Comment NOT EXISTS!");
    }

    return res.status(200).json( new ApiResponse(200 , comment , "Comment Update successfully "))
});

const deleteComment = asyncHandler( async( req, res) => {
    // TODO : DELETE A COMMENT 
    const { commentId } = req.params ;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400 , "Comment ID is not valid");
    }

    const deletecomment = await  Comment.findOneAndDelete({
        _id : commentId ,
        owner : req.user._id
    });

    if(!deletecomment){
        throw new ApiError(404 , "There was problem for while delteing a comment ")
    }

    await Like.deleteMany({
        comment : commentId ,
    })

    return res.status(200).json( new ApiResponse(200 , {} , "Comment was deleted successfully "))
});

export {
    getVideoComment ,
    addComment ,
    updateComment ,
    deleteComment ,

}
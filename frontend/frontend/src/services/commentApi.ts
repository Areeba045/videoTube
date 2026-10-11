import { apiFetch } from "@/utils/api";

export interface BackendComment {
  _id: string;
  content: string;
  video: string;
  owner: {
    _id: string;
    fullname?: string;
    fullName?: string;
    username?: string;
    avatar?: string;
  };
  createdAt: string;
  likesCount?: number;
  dislikeCount? : number;
  userReaction? : "like" | "dislike" | null ;
  commentReaction?: {
    _id: string;
    likedBy: string;
    reactionType: "like" | "dislike";
    comment: string;
  }[];

  parentComment? : string | null ;
  replies? : BackendComment[];
}

export interface CommentApiResponse {
  statusCode: number;
  data: BackendComment[];
  message: string;
  success?: boolean;
}

/**
 * Get all comments of a video
 */
export const getVideoComments = async (
  videoId: string,
  page = 1,
  limit = 10,
) => {
  return apiFetch<CommentApiResponse>(
    `/comments/${videoId}?page=${page}&limit=${limit}`,
  );
};

/**
 * Add a new comment
 */
export const addComment = async (
  videoId: string,
  content: string,
) => {
  return apiFetch<{
    statusCode: number;
    data: BackendComment;
    message: string;
    success?: boolean;
  }>(`/comments/${videoId}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
};

/**
 * Update comment
 */
export const updateComment = async (
  commentId: string,
  newContent: string,
) => {
  return apiFetch<{
    statusCode: number;
    data: BackendComment;
    message: string;
    success?: boolean;
  }>(`/comments/c/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ newContent }),
  });
};

/**
 * Delete comment
 */
export const deleteComment = async (commentId: string) => {
  return apiFetch<{
    statusCode: number;
    data: Record<string, never>;
    message: string;
    success?: boolean;
  }>(`/comments/c/${commentId}`, {
    method: "DELETE",
  });
};

export const addCommentReply = async(
  videoId: string ,
  commentId : string ,
  content : string
) => {
  return apiFetch<{
    statusCode : number ;
    data: BackendComment ;
    message : string ;
    success? : boolean;
  }>(`/comments/${videoId}/${commentId}/reply` ,{
    method : "POST" ,
    body : JSON.stringify({ content }),
  });
};
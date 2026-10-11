// import { apiFetch } from "@/utils/api";

// export type ReactionType = "like" | "dislike";

// export interface ToggleLikeResponse{
//     reaction : ReactionType | null ;
//     likeCount : number ;
//     dislikeCount : number ;

// }


// export async function toggleVideoLike(videoId :  string ,
//     type : ReactionType ,

// ){
//     return apiFetch(`/likes/toggle/v/${videoId}` , {
//         method : "POST", 
//         body : JSON.stringify({ type }), 
//     })
// }


// export async function toggleCommentLike (videoId :  string , type : ReactionType  ){ 
//     return apiFetch(`/likes/toggle/c/${videoId}` , {
//         method : "POST",
//         body : JSON.stringify( { type}) ,
//     })
// }


// export async  function getLikeVideos(){
//  return apiFetch("/likes/videos")
// }

import { apiFetch } from "@/utils/api";

export type ReactionType = "like" | "dislike";

export interface ToggleLikeResponse {
  reaction: ReactionType | null;
  likeCount: number;
  dislikeCount: number;
}

export async function toggleVideoLike(
  videoId: string,
  type: ReactionType
) {
  return apiFetch<ToggleLikeResponse>(
    `/likes/toggle/v/${videoId}`,
    {
      method: "POST",
      body: JSON.stringify({ type }),
    }
  );
}

export async function toggleCommentLike(
  commentId: string,
  type: ReactionType
) {
  return apiFetch(
    `/likes/toggle/c/${commentId}`,
    {
      method: "POST",
      body: JSON.stringify({ type }),
    }
  );
}

export async function getLikeVideos() {
  return apiFetch("/likes/videos");
}
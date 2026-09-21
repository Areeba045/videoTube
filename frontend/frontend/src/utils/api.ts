import type { Comment, Playlist } from "@/types";

const API_BASE_URL =  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const apiFetch = async <T = unknown>(
  endPoint : string , 
  options : RequestInit = {}
) : Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endPoint}` , {
    ...options ,
    credentials : "include",
  });

  const data = await response.json();

  if(!response.ok){
    throw new Error(data?.message || "Something Went Wrong");
  }

  return data as T;
}

export const api = {
  toggleSubscribe: (channelId: string) =>
    apiFetch<{ subscribed: boolean }>("/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId }),
    }),
  toggleLike: (videoId: string) =>
    apiFetch("/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    }),
  toggleDislike: (videoId: string) =>
    apiFetch("/likes/dislike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    }),
  addComment: (videoId: string, text: string) =>
    apiFetch<Comment>("/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, text }),
    }),
  saveToPlaylist: (playlistId: string, videoId: string) =>
    apiFetch("/playlist/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playlistId, videoId }),
    }),
  createPlaylist: (name: string) =>
    apiFetch<Playlist>("/playlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }),
};

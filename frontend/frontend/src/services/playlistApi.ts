import { apiFetch } from "@/utils/api";
import type { Playlist } from "@/types";

interface BackendPlaylist {
  _id: string;
  name: string;
  description?: string;
  owner:
    | string
    | {
        _id: string;
      };
  videos: Array<
    | string
    | {
        _id: string;
      }
  >;
}

export function normalizePlaylist(playlist: BackendPlaylist): Playlist {
  return {
    id: playlist._id,
    name: playlist.name,
    description: playlist.description || "",
    videoIds: (playlist.videos || []).map((video) =>
      typeof video === "string" ? video : video._id,
    ),
    icon: "bookmark",
  };
}

export async function createPlaylist(name: string, description: string = "") {
  return apiFetch("/playlist", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      name,
      description,
    }),
  });
}

export async function getUserPlaylist(userId: string) {
  return apiFetch(`/playlist/user/${userId}`);
}

export async function getPlaylistById(playlistId: string) {
  return apiFetch(`/playlist/${playlistId}`);
}

export async function updatePlaylist(
  playlistId: string,
  data: {
    name?: string;
    description?: string;
  },
) {
  return apiFetch(`/playlist/${playlistId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function deletePlaylist(playlistId: string) {
  return apiFetch(`/playlist/${playlistId}`, {
    method: "DELETE",
  });
}

export async function addVideoToPlaylist(videoId: string, playlistId: string) {
  return apiFetch(`/playlist/add/${videoId}/${playlistId}`, {
    method: "PATCH",
  });
}

export async function removeVideoFromPlaylist(
  videoId: string,
  playlistId: string,
) {
  return apiFetch(`/playlist/remove/${videoId}/${playlistId}`, {
    method: "PATCH",
  });
}

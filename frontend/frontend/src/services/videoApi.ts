import { apiFetch } from "../utils/api";
import type { Video } from "@/types";

interface BackendOwner {
  _id?: string;
  fullName?: string;
  username?: string;
  avatar?: string;
  coverImage?: string;
}

interface BackendVideo {
  _id?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  video?: string;
  duration?: string;
  views?: number;
  createdAt?: string;
  owner?: BackendOwner;
  likesCount?: number;
  dislikeCount?: number;
  isPublished?: boolean;
  comments?: unknown[];
  commentsCount?: number;
  subscriberCount?: number;
  currentUserReaction?: unknown;
  watchedAt?: string;
  isSubscribed: boolean;
  historyId?: string;
}

function formatDuration(duration?: number | string): string {
  if (duration === undefined || duration === null) {
    return "00:00";
  }
  const seconds = Number(duration);
  if (Number.isNaN(seconds)) {
    return String(seconds);
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export const normalizeVideo = (
  video: BackendVideo,
): Video & {
  owner?: unknown;
  comments?: unknown[];
  commentsCount?: number;
  subscriberCount?: number;
  currentUserReaction?: unknown;
} => {
  return {
    id: video._id || "",
    historyId: video.historyId || "",
    title: video.title || "Untitled video",
    description: video.description || "",
    thumbnail: video.thumbnail || "",
    videoUrl: video.video,
    duration: formatDuration(video.duration),
    views: video.views || 0,

    uploadedAt: video.createdAt || "",
    uploadedText: video.createdAt
      ? new Date(video.createdAt).toLocaleDateString()
      : "",

    watchedAt: video.watchedAt || "",

    channelId: video.owner?._id || "",
    category: "Technology",
    likes: video.likesCount || 0,
    dislikes: video.dislikeCount || 0,
    tags: [],
    privacy: video.isPublished ? "public" : "private",

    owner: video.owner
      ? {
          _id: video.owner._id || "",
          username: video.owner.username || "",
          fullName: video.owner.fullName || "",
          avatar: video.owner.avatar || "",
        }
      : undefined,
    comments: video.comments || [],
    commentsCount: video.commentsCount || 0,
    subscriberCount: video.subscriberCount || 0,
    isSubscribed: video.isSubscribed ?? false,
    currentUserReaction: video.currentUserReaction || null,
  };
};

export const getAllVideos = async (page = 1, limit = 10) => {
  return apiFetch<{ data: BackendVideo[] }>(
    `/videos/all?page=${page}&limit=${limit}`,
  );
};

export const getVideoById = async (videoId: string) => {
  return apiFetch<{ data: BackendVideo }>(`/videos/${videoId}`);
};

export const searchVideos = async (search: string) => {
  return apiFetch(`/videos/c/${encodeURIComponent(search)}`);
};

export const uploadVideo = async (
  title: string,
  description: string,
  privacy: "public" | "private",
  thumbnail: File | null,
  video: File,
) => {
  const formData = new FormData();

  formData.append("title", title);
  formData.append("description", description);

  formData.append("isPublished", privacy === "public" ? "true" : "false");
  if (thumbnail) {
    formData.append("thumbnail", thumbnail);
  }

  formData.append("video", video);

  return apiFetch("/videos/upload", {
    method: "POST",
    body: formData,
  });
};

export const updateVideo = async (
  videoId: string,
  data: {
    title?: string;
    description?: string;
    thumbnail?: File;
    video?: File;
  },
) => {
  const formData = new FormData();

  if (data.title !== undefined) {
    formData.append("title", data.title);
  }

  if (data.description !== undefined) {
    formData.append("description", data.description);
  }

  if (data.thumbnail) {
    formData.append("thumbnail", data.thumbnail);
  }

  if (data.video) {
    formData.append("video", data.video);
  }

  return apiFetch(`/videos/${videoId}`, {
    method: "PATCH",
    body: formData,
  });
};

export const deleteVideo = async (videoId: string) => {
  return apiFetch(`/videos/${videoId}`, {
    method: "DELETE",
  });
};

export const togglePublishStatus = async (videoId: string) => {
  return apiFetch(`/videos/toggle/published/${videoId}`, {
    method: "PATCH",
  });
};

export const getMyVideos = async () => {
  return apiFetch("/videos/my-videos");
};

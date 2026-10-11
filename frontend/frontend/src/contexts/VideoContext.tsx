import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Video } from "@/types";

import {
  getAllVideos,
  uploadVideo,
  deleteVideo as deleteVideoApi,
  updateVideo as updateVideoApi,
  togglePublishStatus,
  normalizeVideo,
  getMyVideos,
} from "../services/videoApi.ts";

import { useToast } from "@/components/Toast.tsx";

interface PublishData {
  title: string;
  description: string;
  privacy: "public" | "private";
  thumbnail: File | null;
  video: File;
}

interface UpdateVideoData {
  title?: string;
  description?: string;
  thumbnail?: File;
  video?: File;
}

interface VideoContextValue {
  video: Video[];
  myVideos: Video[];
  loading: boolean;
  error: string;
  fetchVideos: () => Promise<void>;
  fetchMyVideos: () => Promise<void>;
  publishVideo: (data: PublishData) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;
  updateVideo: (videoId: string, data: UpdateVideoData) => Promise<void>;
  togglePublish: (videoId: string) => Promise<void>;
  updateVideoViews: (videoId: string, views: number) => void;
}

const VideoContext = createContext<VideoContextValue | null>(null);

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();

  const [videos, setVideos] = useState<Video[]>([]);

  const [myVideos, setMyVideos] = useState<Video[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function fetchMyVideos() {
    try {
      const response: any = await getMyVideos();

      const normalizeVideos = (response.data || []).map(normalizeVideo);

      setMyVideos(normalizeVideos);
    } catch (error) {
      console.error("Failed to load my videos:", error);
    }
  }

  async function fetchVideos() {
    try {
      setLoading(true);
      setError("");
      const response = await getAllVideos(1, 50);

      console.log("GET ALL VIDEOS RESPONSE : ", response);
      const normalizeVideos = (response.data || []).map(normalizeVideo);
      setVideos(normalizeVideos);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed  to load Videos ";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVideos();
    fetchMyVideos();
  }, []);

  async function publishVideo(data: PublishData) {
    try {
      setLoading(true);

      const response: any = await uploadVideo(
        data.title,
        data.description,
        data.privacy,
        data.thumbnail,
        data.video,
      );

      console.log(" VIDEO UPLOAD RESPONSE : ", response);

      const newVideo = normalizeVideo(response.data);

      setMyVideos((currentVideos) => [newVideo, ...currentVideos]);

      if (newVideo.privacy === "public") {
        setVideos((currentVideos) => [newVideo, ...currentVideos]);
      }
      showToast("Video uploaded successsfully ");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Video upload failed";

      showToast(message, "error");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function deleteVideo(videoId: string) {
    try {
      await deleteVideoApi(videoId);

      setVideos((currentVideos) =>
        currentVideos.filter((video) => video.id !== videoId),
      );

      setMyVideos((currentVideos) =>
        currentVideos.filter((video) => video.id !== videoId),
      );
      showToast("Video deleted", "info");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete video";

      showToast(message, "error");
    }
  }

  async function updateVideo(videoId: string, data: UpdateVideoData) {
    try {
      const response = await updateVideoApi(videoId, data);
      const updateVideo = normalizeVideo(response.data);

      setVideos((currentVideos) =>
        currentVideos.map((video) =>
          video.id === videoId ? updateVideo : video,
        ),
      );

      setMyVideos((currentVideos) =>
        currentVideos.map((video) =>
          video.id === videoId ? updateVideo : video,
        ),
      );
      showToast("Video updated successfully ");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update video";

      showToast(message, "error");
      throw error;
    }
  }

  async function togglePublish(videoId: string) {
    try {
      await togglePublishStatus(videoId);

      setMyVideos((currentVideos) =>
        currentVideos.map((video) =>
          video.id === videoId
            ? {
                ...video,
                privacy: video.privacy === "public" ? "private" : "public",
              }
            : video,
        ),
      );
      setVideos((currentVideos) => {
        const existingVideo = currentVideos.find(
          (video) => video.id === videoId,
        );

        if (!existingVideo) {
          return currentVideos;
        }

        const newPrivacy =
          existingVideo.privacy === "public" ? "private" : "public";

        //Becoming private -> remove from public feed
        if (newPrivacy === "private") {
          return currentVideos.filter((video) => video.id !== videoId);
        }

        // Becoming public -> update it in public feed
        return currentVideos.map((video) =>
          video.id === videoId
            ? {
                ...video,
                privacy: "public",
              }
            : video,
        );
      });
      showToast("Video privacy update ", "success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update publish status";

      showToast(message, "error");
      throw error;
    }
  }

  const updateVideoViews = useCallback((videoId: string, views: number) => {
    setVideos((currentVideos) =>
      currentVideos.map((video) =>
        video.id === videoId ? { ...video, views } : video,
      ),
    );

    setMyVideos((currentVideos) =>
      currentVideos.map((video) =>
        video.id === videoId ? { ...video, views } : video,
      ),
    );
  }, []);

  return (
    <VideoContext.Provider
      value={{
        video: videos,
        myVideos,
        loading,
        error,
        fetchVideos,
        fetchMyVideos,
        publishVideo,
        deleteVideo,
        updateVideo,
        togglePublish,
        updateVideoViews,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
}

export function useVideos() {
  const context = useContext(VideoContext);

  if (!context) {
    throw new Error("useVideos must be used inside VideoProvider");
  }

  return context;
}

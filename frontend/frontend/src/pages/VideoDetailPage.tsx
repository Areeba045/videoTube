import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VideoDetail from "@/components/VideoDetail";
import { useVideos } from "@/contexts/VideoContext";
import { useLike } from "@/contexts/likeContext";
import type { ReactionType } from "@/services/likeApi";
import { toggleCommentLike } from "@/services/likeApi";
import {
  getAllVideos,
  getVideoById,
  normalizeVideo,
} from "@/services/videoApi";
import { useComments } from "@/contexts/CommentsContext";
import type { Playlist, User, Video } from "@/types";
import { useToast } from "@/components/Toast";
import { useSubscriptions } from "@/contexts/SubscriptionContext";
import { addtoWatchHistory } from "@/services/historyApi";

interface VideoDetailPageProps {
  currentUser: User | null;
  playlists: Playlist[];
  getUserById: (id: string) => User | undefined;
  onSaveToPlaylist: (playlistId: string, videoId: string) => void;
  onCreatePlaylist: (name: string, description: string) => void;
}

export default function VideoDetailPage({
  currentUser,
  playlists,
  getUserById,
  onSaveToPlaylist,
  onCreatePlaylist,
}: VideoDetailPageProps) {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { updateVideoViews } = useVideos();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { reactions, toggleLike, loadLikedVideos, syncReaction } = useLike();

  const {
    comments,
    loadComments,
    addComment,
    addReply,
    updateComment,
    deleteComment,
  } = useComments();

  const {
    toggleSubscription: toggleSubscriptionContext,
    isSubscribed,
    subscriberCounts,
    fetchSubscriberCount,
  } = useSubscriptions();

  useEffect(() => {
    if (!videoId) return;

    loadComments(videoId);
  }, [videoId, loadComments]);

  useEffect(() => {
    if (!currentUser) return;

    loadLikedVideos();
  }, [currentUser?.id, loadLikedVideos]);

  useEffect(() => {
    if (!videoId || !currentUser) return;

    addtoWatchHistory(videoId);
  }, [videoId, currentUser]);

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getVideoById(videoId), getAllVideos()])
      .then(([videoResponse, allVideosResponse]) => {
        if (cancelled) return;
        const loadedVideo = normalizeVideo(videoResponse.data);

        console.log("RAW VIDEO API RESPONSE:", videoResponse.data);

        console.log("BACKEND DISLIKE COUNT:", videoResponse.data.dislikeCount);

        console.log("NORMALIZED VIDEO DISLIKES:", loadedVideo.dislikes);

        const loadedVideos = (allVideosResponse.data || []).map(normalizeVideo);
        setVideo(loadedVideo);

        syncReaction(
          loadedVideo.id,
          loadedVideo.currentUserReaction as ReactionType | null,
        );
        updateVideoViews(loadedVideo.id, loadedVideo.views);
        setRelatedVideos(
          loadedVideos
            .filter(
              (item) => item.id !== loadedVideo.id && item.privacy === "public",
            )
            .slice(0, 8),
        );
      })
      .catch((requestError) => {
        if (!cancelled)
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load video",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [videoId, updateVideoViews]);

  const channelId = video?.owner?._id || video?.channelId;

  useEffect(() => {
    if (!channelId) return;

    fetchSubscriberCount(channelId);
  }, [channelId, fetchSubscriberCount]);

  if (loading)
    return (
      <div className="py-24 text-center text-sm text-secondary-custom">
        Loading video...
      </div>
    );
  if (error || !video)
    return (
      <div className="py-24 text-center text-sm text-error">
        {error || "Video not found"}
      </div>
    );

  if (!channelId) {
    return (
      <div className="py-24 text-center text-sm text-error">
        Channel information not found
      </div>
    );
  }

  const channel: User = {
    id: channelId,
    name: video.owner?.fullName || video.owner?.username || "Unknown channel",
    handle: video.owner?.username || "",
    avatar: video.owner?.avatar || "",
    subscribers: subscriberCounts[channelId] ?? 0,
    isSubscribed: isSubscribed(channelId),
  };

  const subscribe = video.isSubscribed ?? false;

  const handleToggleLike = async (id: string) => {
    if (!currentUser) {
      showToast("Please login to like this video");
      return;
    }

    try {
      const response = await toggleLike(id, "like");

      // Update video count immediately
      setVideo((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          likes: response.likeCount,
          dislikes: response.dislikeCount,
        };
      });

      showToast(
        response.reaction === "like" ? "Video liked!" : "Like removed",
        "success",
      );
    } catch (error) {
      console.error("Like Failed:", error);
      showToast("Failed to update like", "error");
    }
  };

  const handleToggleSubscribe = async (channelId: string) => {
    if (!currentUser) {
      showToast("Please login to subscribe");
      return;
    }

    try {
      const next = await toggleSubscriptionContext(channelId);

      setVideo((prev) =>
        prev
          ? {
              ...prev,
              isSubscribed: next,
            }
          : prev,
      );

      showToast(
        next ? "Subscribed!" : "Unsubscribed",
        next ? "success" : "info",
      );
    } catch (error) {
      console.error("Subscription failed:", error);

      showToast("Failed to update subscription", "error");
    }
  };

  const handleToggleDislike = async (id: string) => {
    if (!currentUser) {
      showToast("Please login to dislike this video");
      return;
    }

    try {
      const response = await toggleLike(id, "dislike");

      setVideo((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          likes: response.likeCount,
          dislikes: response.dislikeCount,
        };
      });

      showToast(
        response.reaction === "dislike" ? "Video disliked!" : "Dislike removed",
        "success",
      );
    } catch (error) {
      console.error("Dislike failed:", error);
      showToast("Failed to update reaction", "error");
    }
  };

  const handleAddReply = async (commentId: string, text: string) => {
    if (!currentUser) {
      console.error("You must be logged in to reply.");
      return;
    }

    if (!text.trim()) return;

    try {
      await addReply(video.id, commentId, text.trim(), currentUser);
    } catch (error) {
      console.error("Failed to add reply:", error);
    }
  };

  const handleAddComment = async (id: string, text: string) => {
    if (!currentUser) {
      showToast("Please login to comment");
      return;
    }

    try {
      await addComment(id, text, currentUser);

      showToast("Comment posted!", "success");
    } catch (error) {
      console.error("Failed to add comment:", error);

      showToast(
        error instanceof Error ? error.message : "Failed to post comment",
        "error",
      );
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);

      showToast("Comment deleted!", "success");
    } catch (error) {
      console.error("Failed to delete comment:", error);

      showToast(
        error instanceof Error ? error.message : "Failed to delete comment",
        "error",
      );
    }
  };

  const handleEditComment = async (commentId: string, text: string) => {
    try {
      await updateComment(commentId, text);

      showToast("Comment updated!", "success");
    } catch (error) {
      console.error("Failed to update comment:", error);

      showToast(
        error instanceof Error ? error.message : "Failed to update comment",
        "error",
      );
    }
  };

  const handleLikeComment = async (
    commentId: string,
    type: "like" | "dislike",
  ) => {
    if (!currentUser) {
      showToast("Please login to react to a comment");
      return;
    }

    if (!videoId) return;

    try {
      console.log("Reacting to comment/reply ID:", commentId, type);

      await toggleCommentLike(commentId, type);

      await loadComments(videoId);

      showToast(
        type === "like" ? "Comment liked!" : "Comment disliked!",
        "success",
      );
    } catch (error) {
      console.error("Comment/reply reaction failed:", error);
      showToast("Failed to update comment reaction", "error");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/watch/${video.id}`,
      );
      showToast("Link copied to clipboard!");
    } catch {
      showToast("Failed to copy link", "error");
    }
  };

  const currentReaction = reactions[video.id];

  const likedVideos = new Set(currentReaction === "like" ? [video.id] : []);

  const dislikedVideos = new Set(
    currentReaction === "dislike" ? [video.id] : [],
  );

  return (
    <VideoDetail
      video={video}
      channel={channel}
      currentUser={currentUser}
      comments={comments}
      likedVideos={likedVideos}
      dislikedVideos={dislikedVideos}
      playlists={playlists}
      subscribedChannelIds={subscribe ? new Set([channel.id]) : new Set()}
      onBack={() => navigate(-1)}
      onToggleSubscribe={handleToggleSubscribe}
      onToggleLike={handleToggleLike}
      onToggleDislike={handleToggleDislike}
      onAddComment={handleAddComment}
      onAddReply={handleAddReply}
      onLikeComment={handleLikeComment}
      onEditComment={handleEditComment}
      onDeleteComment={handleDeleteComment}
      onSaveToPlaylist={onSaveToPlaylist}
      onCreatePlaylist={onCreatePlaylist}
      onShare={handleShare}
      relatedVideos={relatedVideos}
      onPlayVideo={(id) => navigate(`/watch/${id}`)}
      onNavigateChannel={(id) => navigate(`/channel/${id}`)}
      getUserById={getUserById}
    />
  );
}

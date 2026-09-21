import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VideoDetail from "@/components/VideoDetail";
import { getAllVideos, getVideoById, normalizeVideo } from "@/services/videoApi";
import { api } from "@/utils/api";
import { comments as initialComments } from "@/data";
import type { Comment, Playlist, User, Video } from "@/types";
import { useToast } from "@/components/Toast";

interface VideoDetailPageProps {
  currentUser: User;
  playlists: Playlist[];
  getUserById: (id: string) => User | undefined;
  onSaveToPlaylist: (playlistId: string, videoId: string) => void;
  onCreatePlaylist: (name: string) => void;
}

export default function VideoDetailPage({
  currentUser, playlists, getUserById,
  onSaveToPlaylist, onCreatePlaylist,
}: VideoDetailPageProps) {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [dislikedVideos, setDislikedVideos] = useState<Set<string>>(new Set());
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getVideoById(videoId), getAllVideos()])
      .then(([videoResponse, allVideosResponse]) => {
        if (cancelled) return;
        const loadedVideo = normalizeVideo(videoResponse.data);
        const loadedVideos = (allVideosResponse.data || []).map(normalizeVideo);
        setVideo(loadedVideo);
        setRelatedVideos(loadedVideos.filter((item) => item.id !== loadedVideo.id && item.privacy === "public").slice(0, 8));
        setComments(initialComments.filter((comment) => comment.videoId === loadedVideo.id));
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Failed to load video");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [videoId]);

  if (loading) return <div className="py-24 text-center text-sm text-secondary-custom">Loading video...</div>;
  if (error || !video) return <div className="py-24 text-center text-sm text-error">{error || "Video not found"}</div>;

  const channel = getUserById(video.channelId) || { id: video.channelId, name: "Unknown channel", handle: "", avatar: "", subscribers: 0, isSubscribed: false };

  const handleToggleLike = async (id: string) => {
    setLikedVideos((previous) => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    setDislikedVideos((previous) => { const next = new Set(previous); next.delete(id); return next; });
    await api.toggleLike(id);
  };

  const handleToggleSubscribe = async (channelId: string) => {
    const next = !subscribed;
    setSubscribed(next);
    await api.toggleSubscribe(channelId);
  };

  const handleToggleDislike = async (id: string) => {
    setDislikedVideos((previous) => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    setLikedVideos((previous) => { const next = new Set(previous); next.delete(id); return next; });
    await api.toggleDislike(id);
  };

  const handleAddComment = async (id: string, text: string) => {
    const comment = await api.addComment(id, text);
    setComments((previous) => [comment, ...previous]);
    showToast("Comment posted!");
  };

  const handleAddReply = (commentId: string, text: string) => {
    const reply: Comment = { id: `c${Date.now()}`, videoId: video.id, userId: currentUser.id, text, likes: 0, createdAt: "just now", replies: [] };
    setComments((previous) => previous.map((comment) => comment.id === commentId ? { ...comment, replies: [...comment.replies, reply] } : comment));
    showToast("Reply posted!");
  };

  const handleLikeComment = (commentId: string) => {
    setLikedComments((previous) => { const next = new Set(previous); if (next.has(commentId)) next.delete(commentId); else next.add(commentId); return next; });
    setComments((previous) => previous.map((comment) => comment.id === commentId ? { ...comment, likes: likedComments.has(commentId) ? comment.likes - 1 : comment.likes + 1 } : comment));
  };

  const handleShare = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/watch/${video.id}`); showToast("Link copied to clipboard!"); }
    catch { showToast("Failed to copy link", "error"); }
  };

  return <VideoDetail video={video} channel={channel} currentUser={currentUser} comments={comments} likedVideos={likedVideos} dislikedVideos={dislikedVideos} playlists={playlists} subscribedChannelIds={subscribed ? new Set([channel.id]) : new Set()} onBack={() => navigate(-1)} onToggleSubscribe={handleToggleSubscribe} onToggleLike={handleToggleLike} onToggleDislike={handleToggleDislike} onAddComment={handleAddComment} onAddReply={handleAddReply} onLikeComment={handleLikeComment} onSaveToPlaylist={onSaveToPlaylist} onCreatePlaylist={onCreatePlaylist} onShare={handleShare} relatedVideos={relatedVideos} onPlayVideo={(id) => navigate(`/watch/${id}`)} onNavigateChannel={(id) => navigate(`/channel/${id}`)} getUserById={getUserById} />;
}

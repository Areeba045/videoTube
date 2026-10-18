import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Scissors,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipForward,
  SkipBack,
  CheckCircle2,
  MoreVertical,
  Bookmark,
  Bell,
  Pencil,
  Trash2,
  Plus,
  X,
  Check,
} from "lucide-react";
import type { Video, User, Comment, Playlist } from "../types";
import { formatViews, formatSubscribers } from "../utils/format";

interface VideoDetailProps {
  video: Video;
  channel: User;
  currentUser: User | null;
  comments: Comment[];
  likedVideos: Set<string>;
  dislikedVideos: Set<string>;
  playlists: Playlist[];
  subscribedChannelIds: Set<string>;
  onBack: () => void;
  onToggleSubscribe: (channelId: string) => void;
  onToggleLike: (videoId: string) => void;
  onToggleDislike: (videoId: string) => void;
  onAddComment: (videoId: string, text: string) => void;
  onAddReply: (commentId: string, text: string) => void;
  onLikeComment: (commentId: string, type: "like" | "dislike") => void;
  onSaveToPlaylist: (playlistId: string, videoId: string) => void;
  onCreatePlaylist?: (name: string , description : string) => void;
  onShare: (videoId: string) => void;
  onEditComment?: (commentId: string, text: string) => void;
  onDeleteComment?: (commentId: string) => void;
  relatedVideos: Video[];
  onPlayVideo: (videoId: string) => void;
  onNavigateChannel?: (channelId: string) => void;
  getUserById: (id: string) => User | undefined;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function parseDuration(duration: string): number {
  const parts = duration.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

const SPEEDS = ["0.5x", "1x", "1.5x", "2x"];

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (Number.isNaN(date.getTime()) || seconds < 0) {
    return "Just now";
  }

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}

interface CommentReplyItemProps {
  reply: Comment;
  currentUser: User | null;
  getUserById: (id: string) => User | undefined;
  onAddReply: (commentId: string, text: string) => void;
  onLikeComment: (commentId: string, type: "like" | "dislike") => void;
  onEditComment?: (commentId: string, text: string) => void;
  onDeleteComment?: (commentId: string) => void;
}
function CommentReplyItem({
  reply,
  currentUser,
  getUserById,
  onAddReply,
  onLikeComment,
  onEditComment,
  onDeleteComment,
}: CommentReplyItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.text);

  const replyUser = reply.user || getUserById(reply.userId);
  const isOwnReply = currentUser?.id === reply.userId;

  function submitReply() {
    if (!replyText.trim()) return;

    onAddReply(reply.id, replyText.trim());
    setReplyText("");
    setShowReplyInput(false);
  }

  function saveEdit() {
    if (!editText.trim() || !onEditComment) return;

    onEditComment(reply.id, editText.trim());
    setIsEditing(false);
  }

  if (!replyUser) return null;

  return (
    <div className="flex gap-3">
      <img
        src={replyUser.avatar || "/default-avatar.png"}
        alt={replyUser.name || "User"}
        className="w-8 h-8 rounded-full shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-xs text-primary-custom">
            {replyUser.name}
          </span>

          <span className="text-xs text-secondary-custom">
            {formatTimeAgo(reply.createdAt)}
          </span>

          {isOwnReply && (onEditComment || onDeleteComment) && (
            <div className="relative ml-auto">
              <button
                onClick={() => setShowMenu((previous) => !previous)}
                className="p-1 rounded-full hover:bg-elevated"
                aria-label="Reply options"
              >
                <MoreVertical className="w-4 h-4 text-secondary-custom" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-7 w-36 bg-card rounded-lg shadow-xl border border-base overflow-hidden z-20">
                  {onEditComment && (
                    <button
                      onClick={() => {
                        setEditText(reply.text);
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-elevated text-primary-custom"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}

                  {onDeleteComment && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDeleteComment(reply.id);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-elevated text-error"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") setIsEditing(false);
              }}
              className="w-full bg-transparent border-b border-primary pb-1.5 text-sm outline-none text-primary-custom"
              autoFocus
            />

            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditText(reply.text);
                }}
                className="px-3 py-1 rounded-full text-xs hover:bg-elevated text-primary-custom"
              >
                Cancel
              </button>

              <button
                onClick={saveEdit}
                disabled={!editText.trim()}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-primary-custom">
            {reply.text}
          </p>
        )}

        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={() => onLikeComment(reply.id, "like")}
            className={`flex items-center gap-1 text-xs ${
              reply.userReaction === "like"
                ? "text-red-500"
                : "text-secondary-custom hover:text-primary"
            }`}
          >
            <ThumbsUp
              className={`w-3 h-3 ${
                reply.userReaction === "like" ? "fill-current" : ""
              }`}
            />
            {formatViews(reply.likes)}
          </button>

          <button
            onClick={() => onLikeComment(reply.id, "dislike")}
            className={`flex items-center gap-1 text-xs ${
              reply.userReaction === "dislike"
                ? "text-red-500"
                : "text-secondary-custom hover:text-primary"
            }`}
          >
            <ThumbsDown
              className={`w-3 h-3 ${
                reply.userReaction === "dislike" ? "fill-current" : ""
              }`}
            />
            {formatViews(reply.dislikes)}
          </button>

          <button
            onClick={() => setShowReplyInput((previous) => !previous)}
            className="text-xs font-medium text-secondary-custom hover:text-primary"
          >
            Reply
          </button>
        </div>

        {showReplyInput && (
          <div className="mt-3">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitReply();
              }}
              placeholder={`Reply to ${replyUser.name}...`}
              className="w-full bg-transparent border-b border-base pb-1.5 text-sm outline-none focus:border-primary text-primary-custom"
              autoFocus
            />

            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setShowReplyInput(false);
                  setReplyText("");
                }}
                className="px-3 py-1 rounded-full text-xs hover:bg-elevated text-primary-custom"
              >
                Cancel
              </button>

              <button
                onClick={submitReply}
                disabled={!replyText.trim()}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white disabled:opacity-50"
              >
                Reply
              </button>
            </div>
          </div>
        )}

        {reply.replies && reply.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-2 border-l border-base">
            {reply.replies.map((childReply) => (
              <CommentReplyItem
                key={childReply.id}
                reply={childReply}
                currentUser={currentUser}
                getUserById={getUserById}
                onAddReply={onAddReply}
                onLikeComment={onLikeComment}
                onEditComment={onEditComment}
                onDeleteComment={onDeleteComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoDetail({
  video,
  channel,
  currentUser,
  comments,
  likedVideos,
  dislikedVideos,
  playlists,
  subscribedChannelIds,
  onBack,
  onToggleSubscribe,
  onToggleLike,
  onToggleDislike,
  onAddComment,
  onAddReply,
  onLikeComment,
  onSaveToPlaylist,
  onCreatePlaylist,
  onShare,
  onEditComment,
  onDeleteComment,
  relatedVideos,
  onPlayVideo,
  onNavigateChannel,
  getUserById,
}: VideoDetailProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(75);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState("1x");
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [bellActive, setBellActive] = useState(false);
  const [commentMenuId, setCommentMenuId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const saveRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef<HTMLDivElement>(null);
  const commentMenuRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasRealVideo = !!video.videoUrl;
  const totalDuration = hasRealVideo ? 0 : parseDuration(video.duration);
  const progress = hasRealVideo
    ? 0
    : totalDuration > 0
      ? (currentTime / totalDuration) * 100
      : 0;
  const isLiked = likedVideos.has(video.id);
  const isDisliked = dislikedVideos.has(video.id);

  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(true);
    setBellActive(false);
  }, [video.id]);

  useEffect(() => {
    if (hasRealVideo && videoRef.current) {
      if (isPlaying) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
  }, [isPlaying, hasRealVideo]);

  useEffect(() => {
    if (hasRealVideo && videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = volume / 100;
    }
  }, [isMuted, volume, hasRealVideo]);

  useEffect(() => {
    if (hasRealVideo && videoRef.current) {
      videoRef.current.playbackRate = parseFloat(playbackSpeed);
    }
  }, [playbackSpeed, hasRealVideo]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (saveRef.current && !saveRef.current.contains(e.target as Node))
        setShowSaveMenu(false);
      if (speedRef.current && !speedRef.current.contains(e.target as Node))
        setShowSpeedMenu(false);
      if (
        commentMenuRef.current &&
        !commentMenuRef.current.contains(e.target as Node)
      )
        setCommentMenuId(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isPlaying || hasRealVideo) return;
    const speed = parseFloat(playbackSpeed);
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + speed;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalDuration, hasRealVideo]);

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (hasRealVideo && videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pct * (videoRef.current.duration || 0);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setCurrentTime(((e.clientX - rect.left) / rect.width) * totalDuration);
  }

  function toggleFullscreen() {
    if (playerRef.current) {
      if (!document.fullscreenElement) playerRef.current.requestFullscreen?.();
      else document.exitFullscreen?.();
    }
  }

  function handleAddComment() {
    if (commentText.trim()) {
      onAddComment(video.id, commentText.trim());
      setCommentText("");
    }
  }

  function handleAddReply(commentId: string) {
    if (replyText.trim()) {
      onAddReply(commentId, replyText.trim());
      setReplyText("");
      setShowReplyInput(null);
    }
  }

  function startEditComment(commentId: string, text: string) {
    setEditingCommentId(commentId);
    setEditCommentText(text);
    setCommentMenuId(null);
  }

  function saveEditComment(commentId: string) {
    if (editCommentText.trim() && onEditComment)
      onEditComment(commentId, editCommentText.trim());
    setEditingCommentId(null);
    setEditCommentText("");
  }

  function handleDeleteComment(commentId: string) {
    if (onDeleteComment) onDeleteComment(commentId);
    setCommentMenuId(null);
  }

  function handleMouseMove() {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying)
      controlsTimeoutRef.current = setTimeout(
        () => setShowControls(false),
        3000,
      );
  }

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-4 text-sm font-medium text-secondary-custom hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to feed
      </button>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          {/* Video player */}
          <div
            ref={playerRef}
            className="relative aspect-video rounded-2xl overflow-hidden bg-black group/player"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
          >
            {hasRealVideo ? (
              <video
                ref={videoRef}
                src={video.videoUrl}
                poster={video.thumbnail}
                className="w-full h-full object-cover"
                onClick={() => setIsPlaying(!isPlaying)}
                onTimeUpdate={(e) =>
                  setCurrentTime(e.currentTarget.currentTime)
                }
                onLoadedMetadata={(e) => {
                  if (isPlaying) e.currentTarget.play().catch(() => {});
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                playsInline
              />
            ) : (
              <div
                className="w-full h-full cursor-pointer"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {showControls && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all hover:scale-110">
                      {isPlaying ? (
                        <Pause className="w-7 h-7 text-white" fill="white" />
                      ) : (
                        <Play
                          className="w-7 h-7 text-white ml-1"
                          fill="white"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {showControls && (
              <div
                className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-white font-medium tabular-nums">
                    {formatTime(currentTime)}
                  </span>
                  <div
                    className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer group/bar"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-primary rounded-full relative"
                      style={{
                        width: `${hasRealVideo && videoRef.current ? (currentTime / (videoRef.current.duration || 1)) * 100 : progress}%`,
                      }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className="text-xs text-white font-medium tabular-nums">
                    {hasRealVideo && videoRef.current
                      ? formatTime(videoRef.current.duration || 0)
                      : video.duration}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-white hover:text-primary transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" fill="white" />
                      ) : (
                        <Play className="w-5 h-5" fill="white" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (hasRealVideo && videoRef.current) {
                          videoRef.current.currentTime = Math.max(
                            0,
                            videoRef.current.currentTime - 10,
                          );
                        } else {
                          setCurrentTime(Math.max(0, currentTime - 10));
                        }
                      }}
                      className="text-white hover:text-primary transition-colors"
                    >
                      <SkipBack className="w-5 h-5" fill="white" />
                    </button>
                    <button
                      onClick={() => {
                        if (hasRealVideo && videoRef.current) {
                          videoRef.current.currentTime = Math.min(
                            videoRef.current.duration || 0,
                            videoRef.current.currentTime + 10,
                          );
                        } else {
                          setCurrentTime(
                            Math.min(totalDuration, currentTime + 10),
                          );
                        }
                      }}
                      className="text-white hover:text-primary transition-colors"
                    >
                      <SkipForward className="w-5 h-5" fill="white" />
                    </button>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:text-primary transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        setIsMuted(false);
                      }}
                      className="w-16 h-1 accent-primary cursor-pointer hidden sm:block"
                    />
                    <span className="text-xs text-white font-medium tabular-nums hidden sm:block">
                      {formatTime(currentTime)} /{" "}
                      {hasRealVideo && videoRef.current
                        ? formatTime(videoRef.current.duration || 0)
                        : video.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative" ref={speedRef}>
                      <button
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="text-white hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <Settings className="w-5 h-5" />
                        <span className="text-xs font-medium">
                          {playbackSpeed}
                        </span>
                      </button>
                      {showSpeedMenu && (
                        <div className="absolute right-0 bottom-8 w-24 bg-card rounded-lg shadow-xl border border-base overflow-hidden animate-scale-in">
                          {SPEEDS.map((speed) => (
                            <button
                              key={speed}
                              onClick={() => {
                                setPlaybackSpeed(speed);
                                setShowSpeedMenu(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-elevated transition-colors text-primary-custom ${playbackSpeed === speed ? "text-primary font-semibold" : ""}`}
                            >
                              {speed}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button className="text-white hover:text-primary transition-colors">
                      <Scissors className="w-5 h-5" />
                    </button>
                    <button
                      onClick={toggleFullscreen}
                      className="text-white hover:text-primary transition-colors"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <h1 className="mt-4 text-xl font-bold leading-snug text-primary-custom">
            {video.title}
          </h1>

          {/* Channel + actions */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={channel.avatar}
                alt={channel.name}
                onClick={() => onNavigateChannel?.(channel.id)}
                className="w-11 h-11 rounded-full cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              />
              <div
                className="cursor-pointer"
                onClick={() => onNavigateChannel?.(channel.id)}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-primary-custom hover:text-primary transition-colors">
                    {channel.name}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary-custom" />
                </div>
                <span className="text-xs text-secondary-custom">
                  {formatSubscribers(channel.subscribers)}
                </span>
              </div>
              {subscribedChannelIds.has(channel.id) ? (
                <div className="ml-2 flex items-center gap-2">
                  <button
                    onClick={() => onToggleSubscribe(channel.id)}
                    className="flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-full bg-elevated hover:bg-hover transition-all duration-200 text-primary-custom"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Subscribed
                  </button>
                  <button
                    onClick={() => setBellActive(!bellActive)}
                    className={`p-2.5 rounded-full transition-all duration-200 ${bellActive ? "bg-primary text-white" : "bg-elevated hover:bg-hover text-secondary-custom"}`}
                    aria-label="Notification bell"
                  >
                    <Bell
                      className={`w-4 h-4 ${bellActive ? "fill-white" : ""}`}
                    />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onToggleSubscribe(channel.id)}
                  className="ml-2 text-sm font-semibold text-white bg-primary px-4 py-2.5 rounded-full hover:bg-primary-700 transition-all duration-200"
                >
                  Subscribe
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-elevated rounded-full overflow-hidden">
                <button
                  onClick={() => onToggleLike(video.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 hover:bg-hover transition-colors text-sm font-medium text-primary-custom ${isLiked ? "text-primary" : "text-primary-custom"}`}
                >
                  <ThumbsUp
                    className={`w-4 h-4 ${isLiked ? "fill-primary" : ""}`}
                  />
                  {/* {formatViews(video.likes + (isLiked ? 1 : 0))} */}
                  {formatViews(video.likes)}
                </button>
                <div className="w-px h-6 bg-base" />
                <button
                  onClick={() => onToggleDislike(video.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 hover:bg-hover transition-colors text-sm font-medium text-primary-custom ${isDisliked ? "text-primary" : ""}`}
                >
                  <ThumbsDown
                    className={`w-4 h-4 ${isDisliked ? "fill-primary" : ""}`}
                  />
                  {formatViews(video.dislikes)}
                </button>
              </div>

              <div className="relative" ref={saveRef}>
                <button
                  onClick={() => setShowSaveMenu(!showSaveMenu)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-elevated hover:bg-hover transition-colors text-sm font-medium text-primary-custom"
                >
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:block">Save</span>
                </button>
                {showSaveMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-base overflow-hidden z-10 animate-scale-in">
                    <div className="p-3 border-b border-base">
                      <p className="text-xs font-semibold uppercase tracking-wider text-secondary-custom">
                        Save to playlist
                      </p>
                    </div>
                    <div className="py-1 max-h-64 overflow-y-auto scrollbar-thin">
                      {/* Create new playlist */}
                      {onCreatePlaylist && !showCreatePlaylist && (
                        <button
                          onClick={() => setShowCreatePlaylist(true)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-elevated transition-colors text-primary font-medium"
                        >
                          <Plus className="w-4 h-4" /> Create new playlist
                        </button>
                      )}
                      {showCreatePlaylist && (
                        <div className="px-3 py-2 bg-elevated animate-slide-up">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newPlaylistName}
                              onChange={(e) =>
                                setNewPlaylistName(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  newPlaylistName.trim()
                                ) {
                                  onCreatePlaylist?.(newPlaylistName.trim() , "");
                                  setNewPlaylistName("");
                                  setShowCreatePlaylist(false);
                                }
                              }}
                              placeholder="Playlist name..."
                              className="flex-1 bg-card border border-base rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary transition-colors text-primary-custom placeholder:text-secondary-custom"
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                if (newPlaylistName.trim()) {
                                  onCreatePlaylist?.(newPlaylistName.trim() , "");
                                  setNewPlaylistName("");
                                  setShowCreatePlaylist(false);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary-700 transition-colors"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                setShowCreatePlaylist(false);
                                setNewPlaylistName("");
                              }}
                              className="p-1.5 rounded-lg hover:bg-hover transition-colors"
                            >
                              <X className="w-3 h-3 text-secondary-custom" />
                            </button>
                          </div>
                        </div>
                      )}
                      {/* Existing playlists */}
                      {playlists.map((pl) => {
                        const alreadySaved = pl.videoIds.includes(video.id);
                        return (
                          <button
                            key={pl.id}
                            onClick={() => {
                              if (!alreadySaved) {
                                onSaveToPlaylist(pl.id, video.id);
                              }
                              setShowSaveMenu(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-primary-custom ${alreadySaved ? "opacity-60 cursor-default" : "hover:bg-elevated"}`}
                          >
                            <Bookmark className="w-4 h-4" />
                            <span className="flex-1 text-left">{pl.name}</span>
                            {alreadySaved ? (
                              <span className="text-xs text-success font-medium">
                                Saved
                              </span>
                            ) : (
                              <span className="text-xs text-secondary-custom">
                                {pl.videoIds.length}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => onShare(video.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-elevated hover:bg-hover transition-colors text-sm font-medium text-primary-custom"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:block">Share</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 p-4 rounded-xl bg-card text-sm leading-relaxed border border-base text-primary-custom">
            <div className="flex items-center gap-3 mb-2 font-medium">
              <span>{formatViews(video.views)} views</span>
              <span>•</span>
              <span>{video.uploadedText}</span>
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-elevated">
                <ThumbsUp className="w-3 h-3" /> {formatViews(video.likes)}{" "}
                likes
              </span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-elevated">
                #{video.category}
              </span>
            </div>
            <p className="text-secondary-custom">{video.description}</p>
          </div>

          {/* Comments */}
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-4 text-primary-custom">
              {comments.length} Comments
            </h2>
            <div className="flex gap-3 mb-6">
              <img
                src={video.owner?.avatar}
                alt={video.owner?.username}
                className="w-10 h-10 rounded-full shrink-0"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Add a public comment..."
                  className="w-full bg-transparent border-b border-base pb-2 text-sm outline-none focus:border-primary transition-colors text-primary-custom placeholder:text-secondary-custom"
                />
                {commentText && (
                  <div className="flex justify-end gap-2 mt-2 animate-slide-up">
                    <button
                      onClick={() => setCommentText("")}
                      className="px-3 py-1.5 rounded-full text-sm font-medium hover:bg-elevated transition-colors text-primary-custom"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddComment}
                      className="px-4 py-1.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-700 transition-colors"
                    >
                      Comment
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Comments list */}
            <div className="space-y-5">
              {comments.map((comment) => {
                const commentUser = comment.user || getUserById(comment.userId);

                if (!commentUser) return null;

                const commentUserName =
                  "name" in commentUser ? commentUser.name : "Unknown User";

                const commentUserAvatar =
                  commentUser.avatar || "/default-avatar.png";
                const isOwnComment = currentUser
                  ? comment.userId === currentUser.id
                  : false;
                return (
                  <div key={comment.id} className="flex gap-3 animate-fade-in">
                    <img
                      src={commentUser.avatar}
                      alt={commentUser.name}
                      className="w-10 h-10 rounded-full shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-primary-custom">
                          {commentUser.name}
                        </span>
                        <span className="text-xs text-secondary-custom">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="animate-slide-up">
                          <input
                            type="text"
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && saveEditComment(comment.id)
                            }
                            className="w-full bg-transparent border-b border-primary pb-1.5 text-sm outline-none text-primary-custom"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditCommentText("");
                              }}
                              className="px-3 py-1 rounded-full text-xs font-medium hover:bg-elevated transition-colors text-primary-custom"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveEditComment(comment.id)}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary-700 transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed text-primary-custom">
                          {comment.text}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <button
                          onClick={() => onLikeComment(comment.id, "like")}
                          className={`flex items-center gap-1.5 text-xs transition-colors ${
                            comment.userReaction === "like"
                              ? "text-red-500"
                              : "text-secondary-custom hover:text-primary"
                          }`}
                        >
                          <ThumbsUp
                            className={`w-3.5 h-3.5 ${
                              comment.userReaction === "like"
                                ? "fill-current"
                                : ""
                            }`}
                          />
                          {formatViews(comment.likes)}
                        </button>
                        <button
                          onClick={() => onLikeComment(comment.id, "dislike")}
                          aria-label="Dislike comment"
                          className={`flex items-center gap-1.5 text-xs transition-colors ${
                            comment.userReaction === "dislike"
                              ? "text-red-500"
                              : "text-secondary-custom hover:text-primary"
                          }`}
                        >
                          <ThumbsDown
                            className={`w-3.5 h-3.5 ${
                              comment.userReaction === "dislike"
                                ? "fill-current"
                                : ""
                            }`}
                          />
                          {formatViews(comment.dislikes)}
                        </button>
                        <button
                          onClick={() => {
                            setShowReplyInput(
                              showReplyInput === comment.id ? null : comment.id,
                            );
                            setReplyText("");
                          }}
                          className="text-xs font-medium text-secondary-custom hover:text-primary transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                      {/* Replies */}
                      {comment.replies?.length > 0 && (
                        <div className="mt-3 space-y-3 pl-2 border-l border-base">
                          {comment.replies.map((reply) => (
                            <CommentReplyItem
                              key={reply.id}
                              reply={reply}
                              currentUser={currentUser}
                              getUserById={getUserById}
                              onAddReply={onAddReply}
                              onLikeComment={onLikeComment}
                              onEditComment={onEditComment}
                              onDeleteComment={onDeleteComment}
                            />
                          ))}
                        </div>
                      )}

                      {/* Reply input */}
                      {showReplyInput === comment.id && (
                        <div className="mt-3 flex gap-3 animate-slide-up">
                          <img
                            src={video.owner?.avatar || "/default-avatar.png "}
                            alt={video.owner?.username || "User"}
                            className="w-8 h-8 rounded-full shrink-0"
                          />
                          <div className="flex-1">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleAddReply(comment.id)
                              }
                              placeholder={`Reply to ${commentUser.name}...`}
                              className="w-full bg-transparent border-b border-base pb-1.5 text-sm outline-none focus:border-primary transition-colors text-primary-custom placeholder:text-secondary-custom"
                              autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => {
                                  setShowReplyInput(null);
                                  setReplyText("");
                                }}
                                className="px-3 py-1 rounded-full text-xs font-medium hover:bg-elevated transition-colors text-primary-custom"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleAddReply(comment.id)}
                                className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary-700 transition-colors"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Comment 3-dots menu */}
                    {isOwnComment && (onEditComment || onDeleteComment) && (
                      <div
                        className="relative"
                        ref={
                          commentMenuId === comment.id
                            ? commentMenuRef
                            : undefined
                        }
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCommentMenuId(
                              commentMenuId === comment.id ? null : comment.id,
                            );
                          }}
                          className="p-1 rounded-full hover:bg-elevated transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-secondary-custom" />
                        </button>
                        {commentMenuId === comment.id && (
                          <div
                            className="absolute right-0 top-8 w-36 bg-card rounded-lg shadow-xl border border-base overflow-hidden z-10 animate-scale-in"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {onEditComment && (
                              <button
                                onClick={() =>
                                  startEditComment(comment.id, comment.text)
                                }
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-elevated transition-colors text-primary-custom"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit
                              </button>
                            )}
                            {onDeleteComment && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-elevated transition-colors text-error"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Related videos */}
        <div className="xl:w-96 shrink-0">
          <h3 className="font-semibold text-sm mb-3 text-primary-custom">
            Up next
          </h3>
          <div className="space-y-2">
            {relatedVideos.map((rv) => {
              const rvChannelName =
                rv.owner?.fullName || rv.owner?.username || "Unknown channel";
              return (
                <div
                  key={rv.id}
                  onClick={() => onPlayVideo(rv.id)}
                  className="flex gap-2 cursor-pointer group rounded-lg p-1 hover:bg-card transition-colors"
                >
                  <div className="relative w-40 aspect-video rounded-lg overflow-hidden shrink-0">
                    <img
                      src={rv.thumbnail}
                      alt={rv.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/85 text-white text-[10px] font-medium px-1 py-0.5 rounded">
                      {rv.duration}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h4 className="text-xs font-semibold leading-snug line-clamp-2 transition-all duration-200 text-primary-custom">
                      {rv.title}
                    </h4>
                    <p className="text-[11px] text-secondary-custom mt-1">
                      {rvChannelName}
                    </p>
                    <p className="text-[11px] text-secondary-custom">
                      {formatViews(rv.views)} views • {rv.uploadedText}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

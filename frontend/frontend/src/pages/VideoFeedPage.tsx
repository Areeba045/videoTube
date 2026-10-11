import { useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";

import { useToast } from "@/components/Toast";
import type { Playlist, Video } from "@/types";
import VideoCard from "@/components/VideoCard";

interface VideoFeedPageProps {
  title: string;
  subtitle: string;

  icon: ComponentType<{
    className?: string;
  }>;

  videos: Video[];
  allVideoCount: number;

  playlists: Playlist[];

  activePlaylist?: Playlist;
  activePlaylistId?: string | null;

  emptyMessage: string;

  onSaveToPlaylist: (playlistId: string, videoId: string) => void;

  onRemoveFromPlaylist: (playlistId: string, videoId: string) => void;

  onCreatePlaylist: (name: string, description: string) => void;

  onDeletePlaylist?: (playlistId: string) => Promise<void>;

  onUpdatePlaylist?: (
    playlistId: string,
    data: {
      name?: string;
      description?: string;
    },
  ) => Promise<void>;
}

export default function VideoFeedPage({
  title,
  subtitle,
  icon: CurrentIcon,
  videos,
  allVideoCount,
  playlists,
  activePlaylist,
  activePlaylistId,
  emptyMessage,
  onSaveToPlaylist,
  onRemoveFromPlaylist,
  onCreatePlaylist,
  onDeletePlaylist,
  onUpdatePlaylist,
}: VideoFeedPageProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isEditingPlaylist, setIsEditingPlaylist] = useState(false);

  const [editName, setEditName] = useState("");

  const [editDescription, setEditDescription] = useState("");

  // -------------------------
  // Share video
  // -------------------------
  const handleShare = (videoId: string) => {
    navigator.clipboard
      .writeText(`${window.location.origin}/watch/${videoId}`)
      .then(() => {
        showToast("Link copied to clipboard!");
      })
      .catch(() => {
        showToast("Failed to copy link", "error");
      });
  };

  // -------------------------
  // Open edit form
  // -------------------------
  const handleEditPlaylist = () => {
    if (!activePlaylist) {
      return;
    }

    setEditName(activePlaylist.name);

    setEditDescription(activePlaylist.description || "");

    setIsEditingPlaylist(true);
  };

  // -------------------------
  // Update playlist
  // -------------------------
  const handleUpdatePlaylist = async () => {
    if (!activePlaylistId || !onUpdatePlaylist) {
      return;
    }

    if (!editName.trim()) {
      showToast("Playlist name is required", "error");

      return;
    }

    try {
      await onUpdatePlaylist(activePlaylistId, {
        name: editName.trim(),
        description: editDescription.trim(),
      });

      setIsEditingPlaylist(false);

      showToast("Playlist updated successfully!");
    } catch (error) {
      console.error("Update playlist error:", error);

      showToast("Failed to update playlist", "error");
    }
  };

  // -------------------------
  // Delete playlist
  // -------------------------
  const handleDeletePlaylist = async () => {
    if (!activePlaylistId || !onDeletePlaylist) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this playlist?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await onDeletePlaylist(activePlaylistId);

      showToast("Playlist deleted successfully!");

      navigate("/library");
    } catch (error) {
      console.error("Delete playlist error:", error);

      showToast("Failed to delete playlist", "error");
    }
  };

  return (
    <div className="animate-fade-in">
      {/* =========================
          Header
      ========================= */}
      <div className="mb-6">
        {/* Header top row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left side */}
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <CurrentIcon className="w-5 h-5 text-primary" />
            </div>

            {/* Title + subtitle */}
            <div>
              <h1 className="text-2xl font-bold text-primary-custom">
                {title}
              </h1>

              <p className="text-sm text-secondary-custom">{subtitle}</p>
            </div>
          </div>

          {/* Right side */}
          {activePlaylistId && (
            <div className="flex items-center gap-2">
              {/* Edit */}
              {onUpdatePlaylist && (
                <button
                  type="button"
                  onClick={handleEditPlaylist}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-primary/30 hover:bg-primary/10 transition"
                >
                  Edit Playlist
                </button>
              )}

              {/* Delete */}
              {onDeletePlaylist && (
                <button
                  type="button"
                  onClick={handleDeletePlaylist}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-error border border-error/30 hover:bg-error/10 transition"
                >
                  Delete Playlist
                </button>
              )}
            </div>
          )}
        </div>

        {/* =========================
            Edit Playlist Form
        ========================= */}
        {isEditingPlaylist && activePlaylistId && (
          <div className="mt-5 p-5 rounded-xl border border-primary/20 bg-secondary-custom/5">
            <h2 className="text-lg font-semibold mb-4">Edit Playlist</h2>

            <div className="space-y-4">
              {/* Playlist name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Playlist Name
                </label>

                <input
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-transparent"
                  placeholder="Playlist name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>

                <textarea
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-transparent"
                  placeholder="Playlist description"
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUpdatePlaylist}
                  className="px-4 py-2 rounded-lg bg-primary text-white"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditingPlaylist(false)}
                  className="px-4 py-2 rounded-lg border border-primary/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================
          Videos
      ========================= */}

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mb-4">
            <CurrentIcon className="w-8 h-8 text-secondary-custom" />
          </div>

          <h3 className="text-lg font-semibold mb-1 text-primary-custom">
            No videos here yet
          </h3>

          <p className="text-sm text-secondary-custom max-w-sm">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={() => navigate(`/watch/${video.id}`)}
              playlists={playlists}
              onSaveToPlaylist={onSaveToPlaylist}
              onRemoveFromPlaylist={onRemoveFromPlaylist}
              onShare={handleShare}
              onCreatePlaylist={onCreatePlaylist}
              onNavigateChannel={(channelId) =>
                navigate(`/channel/${channelId}`)
              }
              activePlaylistId={activePlaylistId}
            />
          ))}
        </div>
      )}

      {/* =========================
          Home video count
      ========================= */}

      {title === "Home" && videos.length > 0 && (
        <div className="mt-8 text-center text-sm text-secondary-custom">
          Showing {videos.length} of {allVideoCount} videos
        </div>
      )}
    </div>
  );
}

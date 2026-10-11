import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getAllVideos, normalizeVideo } from "@/services/videoApi";
import { getPlaylistById, normalizePlaylist } from "@/services/playlistApi";
import type { Playlist, User, Video } from "@/types";
import VideoFeedPage from "@/pages/VideoFeedPage";
import { feedIcons } from "@/pages/feedIcons";

type LibraryMode = "library" | "liked" | "playlist";

interface LibraryPageProps {
  mode: LibraryMode;
  playlistId?: string;
  likedVideoIds: Set<string>;
  playlists: Playlist[];
  getUserById: (id: string) => User | undefined;
  onSaveToPlaylist: (playlistId: string, videoId: string) => void;
  onRemoveFromPlaylist: (playlistId: string, videoId: string) => void;
  onCreatePlaylist: (name: string, description: string) => void;
  onDeletePlaylist: (playlistId: string) => Promise<void>;
  onUpdatePlaylist?: (
    playlistId: string,
    data: { name?: string; description?: string },
  ) => Promise<void>;
}

export default function LibraryPage({
  mode,
  playlistId,
  likedVideoIds,
  playlists,
  getUserById,
  onSaveToPlaylist,
  onDeletePlaylist,
  onRemoveFromPlaylist,
  onCreatePlaylist,
  onUpdatePlaylist,
}: LibraryPageProps) {
  const routeParams = useParams<{ playlistId: string }>();
  const selectedPlaylistId = playlistId || routeParams.playlistId;
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<
    Playlist | undefined
  >(undefined);

  useEffect(() => {
    let cancelled = false;
    getAllVideos()
      .then((response) => {
        if (!cancelled) setVideos((response.data || []).map(normalizeVideo));
      })
      .catch((requestError) => {
        if (!cancelled)
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load videos",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode !== "playlist" || !selectedPlaylistId) {
      return;
    }

    let cancelled = false;

    setSelectedPlaylist(undefined);

    getPlaylistById(selectedPlaylistId)
      .then((response) => {
        if (cancelled) return;

        const playlistData = normalizePlaylist(response.data);

        setSelectedPlaylist(playlistData);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error("Failed to get playlist by ID:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [mode, selectedPlaylistId]);
  const playlist =
    mode === "playlist"
      ? selectedPlaylist
      : playlists.find((item) => item.id === selectedPlaylistId);

  const filteredVideos = useMemo(() => {
    // 1. Liked Videos
    if (mode === "liked") {
      return videos.filter((video) => likedVideoIds.has(String(video.id)));
    }

    // 2. Specific Playlist
    if (mode === "playlist") {
      const playlistVideoIds = new Set((playlist?.videoIds || []).map(String));

      return videos.filter((video) => playlistVideoIds.has(String(video.id)));
    }

    // 3. Library: All saved playlist videos
    const savedIds = new Set(
      playlists.flatMap((item) => item.videoIds.map(String)),
    );

    return videos.filter((video) => savedIds.has(String(video.id)));
  }, [mode, videos, likedVideoIds, playlist, playlists]);

  const config =
    mode === "liked"
      ? {
          title: "Liked Videos",
          subtitle: "Videos you enjoyed",
          icon: feedIcons.liked,
          empty: "Like videos to find them here later.",
        }
      : mode === "playlist"
        ? {
            title: playlist?.name || "Playlist",
            subtitle: `${playlist?.videoIds.length || 0} videos`,
            icon: feedIcons.playlist,
            empty: "Save videos to this playlist to see them here.",
          }
        : {
            title: "Library",
            subtitle: "Your saved and playlist videos",
            icon: feedIcons.library,
            empty: "Save videos to playlists to see them here.",
          };

  if (loading)
    return (
      <div className="py-24 text-center text-sm text-secondary-custom">
        Loading videos...
      </div>
    );
  if (error)
    return <div className="py-24 text-center text-sm text-error">{error}</div>;

  return (
    <VideoFeedPage
      title={config.title}
      subtitle={config.subtitle}
      icon={config.icon}
      videos={filteredVideos}
      allVideoCount={videos.length}
      playlists={playlists}
      activePlaylistId={selectedPlaylistId}
      emptyMessage={config.empty}
      onSaveToPlaylist={onSaveToPlaylist}
      onRemoveFromPlaylist={onRemoveFromPlaylist}
      onCreatePlaylist={onCreatePlaylist}
      onDeletePlaylist={onDeletePlaylist}
      activePlaylist={playlist}
      onUpdatePlaylist={onUpdatePlaylist}
    />
  );
}

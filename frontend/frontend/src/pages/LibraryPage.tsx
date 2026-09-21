import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getAllVideos, normalizeVideo } from "@/services/videoApi";
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
  onCreatePlaylist: (name: string) => void;
}

export default function LibraryPage({
  mode, playlistId, likedVideoIds, playlists,
  getUserById, onSaveToPlaylist,
  onRemoveFromPlaylist, onCreatePlaylist,
}: LibraryPageProps) {
  const routeParams = useParams<{ playlistId: string }>();
  const selectedPlaylistId = playlistId || routeParams.playlistId;
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAllVideos()
      .then((response) => {
        if (!cancelled) setVideos((response.data || []).map(normalizeVideo));
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Failed to load videos");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const playlist = playlists.find((item) => item.id === selectedPlaylistId);
  const filteredVideos = useMemo(() => {
    if (mode === "liked") return videos.filter((video) => likedVideoIds.has(video.id));
    if (mode === "playlist") return (playlist?.videoIds || []).map((id) => videos.find((video) => video.id === id)).filter((video): video is Video => Boolean(video));
    const savedIds = new Set(playlists.flatMap((item) => item.videoIds));
    return videos.filter((video) => savedIds.has(video.id));
  }, [mode, videos, likedVideoIds, playlist, playlists]);

  const config = mode === "liked"
    ? { title: "Liked Videos", subtitle: "Videos you enjoyed", icon: feedIcons.liked, empty: "Like videos to find them here later." }
    : mode === "playlist"
      ? { title: playlist?.name || "Playlist", subtitle: `${playlist?.videoIds.length || 0} videos`, icon: feedIcons.playlist, empty: "Save videos to this playlist to see them here." }
      : { title: "Library", subtitle: "Your saved and playlist videos", icon: feedIcons.library, empty: "Save videos to playlists to see them here." };

  if (loading) return <div className="py-24 text-center text-sm text-secondary-custom">Loading videos...</div>;
  if (error) return <div className="py-24 text-center text-sm text-error">{error}</div>;

  return <VideoFeedPage title={config.title} subtitle={config.subtitle} icon={config.icon} videos={filteredVideos} allVideoCount={videos.length} getUserById={getUserById} playlists={playlists} activePlaylistId={selectedPlaylistId} emptyMessage={config.empty} onSaveToPlaylist={onSaveToPlaylist} onRemoveFromPlaylist={onRemoveFromPlaylist} onCreatePlaylist={onCreatePlaylist} />;
}

import { useEffect, useState } from "react";
import { getWatchHistory } from "@/services/userApi";
import { normalizeVideo } from "@/services/videoApi";
import type { Playlist, User, Video } from "@/types";
import VideoFeedPage from "@/pages/VideoFeedPage";
import { feedIcons } from "@/pages/feedIcons";

interface HistoryPageProps {
  user: User | null;
  playlists: Playlist[];
  getUserById: (id: string) => User | undefined;
  onSaveToPlaylist: (playlistId: string, videoId: string) => void;
  onRemoveFromPlaylist: (playlistId: string, videoId: string) => void;
  onCreatePlaylist: (name: string) => void;
}

export default function HistoryPage({
  user, playlists, getUserById,
  onSaveToPlaylist, onRemoveFromPlaylist,
  onCreatePlaylist,
}: HistoryPageProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setVideos([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    getWatchHistory()
      .then((response) => {
        if (!cancelled) setVideos(response.data.map((video) => normalizeVideo(video)));
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Failed to load watch history");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  if (!user) return <div className="py-24 text-center text-sm text-secondary-custom">Sign in to view your watch history.</div>;
  if (loading) return <div className="py-24 text-center text-sm text-secondary-custom">Loading history...</div>;
  if (error) return <div className="py-24 text-center text-sm text-error">{error}</div>;

  return <VideoFeedPage title="History" subtitle="Your recently watched videos" icon={feedIcons.history} videos={videos} allVideoCount={videos.length} getUserById={getUserById} playlists={playlists} emptyMessage="Videos you watch will appear here." onSaveToPlaylist={onSaveToPlaylist} onRemoveFromPlaylist={onRemoveFromPlaylist} onCreatePlaylist={onCreatePlaylist} />;
}

import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { useVideos } from "@/contexts/VideoContext";
import type { Playlist, User } from "@/types";
import VideoFeedPage from "@/pages/VideoFeedPage";
import { feedIcons } from "@/pages/feedIcons";

interface HomePageProps {
  user: User | null;

  playlists: Playlist[];

  onSaveToPlaylist: (playlistId: string, videoId: string) => void;

  onRemoveFromPlaylist: (playlistId: string, videoId: string) => void;

  onCreatePlaylist: (name: string, description: string) => void;
}

export default function HomePage({
  playlists,
  onSaveToPlaylist,
  onRemoveFromPlaylist,
  onCreatePlaylist,
}: HomePageProps) {
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get("q") || "";

  const { video: videos, loading, error } = useVideos();

  console.log(
    "VIDEOS AFTER NORMALIZE:",
    videos.map((video) => ({
      title: video.title,
      owner: video.owner?.username,
      channelId: video.channelId,
      privacy: video.privacy,
    })),
  );

  const displayedVideos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return videos.filter((video) => {
      // Only public videos should appear on Home
      const isPublic = video.privacy === "public";

      const matchesSearch =
        !query ||
        video.title.toLowerCase().includes(query) ||
        video.category.toLowerCase().includes(query) ||
        video.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        video.owner?.username?.toLowerCase().includes(query) ||
        video.owner?.fullName?.toLowerCase().includes(query);

      return isPublic && matchesSearch;
    });
  }, [videos, searchQuery]);

  if (loading) {
    return (
      <div className="py-24 text-center text-sm text-secondary-custom">
        Loading videos...
      </div>
    );
  }

  if (error) {
    return <div className="py-24 text-center text-sm text-error">{error}</div>;
  }

  return (
    <VideoFeedPage
      title="Home"
      subtitle="Discover videos from creators worldwide"
      icon={feedIcons.home}
      videos={displayedVideos}
      allVideoCount={
        videos.filter((video) => video.privacy === "public").length
      }
      playlists={playlists}
      emptyMessage={
        searchQuery
          ? "No videos match your search. Try a different query."
          : "No public videos available yet."
      }
      onSaveToPlaylist={onSaveToPlaylist}
      onRemoveFromPlaylist={onRemoveFromPlaylist}
      onCreatePlaylist={onCreatePlaylist}
    />
  );
}

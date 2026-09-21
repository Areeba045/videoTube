// import { type ComponentType } from "react";
// import { useNavigate } from "react-router-dom";
// import { useToast } from "@/components/Toast";
// import type { Playlist, User, Video } from "@/types";
// import VideoCard from "@/components/VideoCard";

// interface VideoFeedPageProps {
//   title: string;
//   subtitle: string;
//   icon: ComponentType<{ className?: string }>;
//   videos: Video[];
//   allVideoCount: number;
//   // getUserById: (id: string) => User | undefined;
//   playlists: Playlist[];
//   activePlaylistId?: string | null;
//   emptyMessage: string;
//   onSaveToPlaylist: (playlistId: string, videoId: string) => void;
//   onRemoveFromPlaylist: (playlistId: string, videoId: string) => void;
//   onCreatePlaylist: (name: string) => void;
// }

// export default function VideoFeedPage({
//   title, subtitle, icon: CurrentIcon, videos, allVideoCount ,
//   playlists, activePlaylistId,
//   emptyMessage, onSaveToPlaylist, onRemoveFromPlaylist,
//   onCreatePlaylist,
// }: VideoFeedPageProps) {
//   const navigate = useNavigate();
//   const { showToast } = useToast();
//   const handleShare = (videoId: string) => {
//     navigator.clipboard.writeText(`${window.location.origin}/watch/${videoId}`).then(() => showToast("Link copied to clipboard!")).catch(() => showToast("Failed to copy link", "error"));
//   };
//   return (
//     <div className="animate-fade-in">
//       <div className="mb-6 flex items-center gap-3">
//         <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center"><CurrentIcon className="w-5 h-5 text-primary" /></div>
//         <div><h1 className="text-2xl font-bold text-primary-custom">{title}</h1><p className="text-sm text-secondary-custom">{subtitle}</p></div>
//       </div>
//       {videos.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-24 text-center"><div className="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mb-4"><CurrentIcon className="w-8 h-8 text-secondary-custom" /></div><h3 className="text-lg font-semibold mb-1 text-primary-custom">No videos here yet</h3><p className="text-sm text-secondary-custom max-w-sm">{emptyMessage}</p></div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-6">
//           {videos.map((video) => {
//             // const channel = getUserById(video.channelId);
//             // if (!channel) return null;
//             return <VideoCard key={video.id} video={video} onPlay={() => navigate(`/watch/${video.id}`)} playlists={playlists} onSaveToPlaylist={onSaveToPlaylist} onRemoveFromPlaylist={onRemoveFromPlaylist} onShare={handleShare} onCreatePlaylist={onCreatePlaylist} onNavigateChannel={(channelId) => navigate(`/channel/${channelId}`)} activePlaylistId={activePlaylistId} />;
//           })}
//         </div>
//       )}
//       {title === "Home" && videos.length > 0 && <div className="mt-8 text-center text-sm text-secondary-custom">Showing {videos.length} of {allVideoCount} videos</div>}
//     </div>
//   );
// }


import { type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/Toast";
import type { Playlist, User, Video } from "@/types";
import VideoCard from "@/components/VideoCard";

interface VideoFeedPageProps {
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  videos: Video[];
  allVideoCount: number;
  // getUserById: (id: string) => User | undefined;
  playlists: Playlist[];
  activePlaylistId?: string | null;
  emptyMessage: string;
  onSaveToPlaylist: (playlistId: string, videoId: string) => void;
  onRemoveFromPlaylist: (playlistId: string, videoId: string) => void;
  onCreatePlaylist: (name: string) => void;
}

export default function VideoFeedPage({
  title, subtitle, icon: CurrentIcon, videos, allVideoCount ,
  playlists, activePlaylistId,
  emptyMessage, onSaveToPlaylist, onRemoveFromPlaylist,
  onCreatePlaylist,
}: VideoFeedPageProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const handleShare = (videoId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/watch/${videoId}`).then(() => showToast("Link copied to clipboard!")).catch(() => showToast("Failed to copy link", "error"));
  };
  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center"><CurrentIcon className="w-5 h-5 text-primary" /></div>
        <div><h1 className="text-2xl font-bold text-primary-custom">{title}</h1><p className="text-sm text-secondary-custom">{subtitle}</p></div>
      </div>
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center"><div className="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mb-4"><CurrentIcon className="w-8 h-8 text-secondary-custom" /></div><h3 className="text-lg font-semibold mb-1 text-primary-custom">No videos here yet</h3><p className="text-sm text-secondary-custom max-w-sm">{emptyMessage}</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-6">
          {videos.map((video) => {
            // const channel = getUserById(video.channelId);
            // if (!channel) return null;
            return <VideoCard key={video.id} video={video} onPlay={() => navigate(`/watch/${video.id}`)} playlists={playlists} onSaveToPlaylist={onSaveToPlaylist} onRemoveFromPlaylist={onRemoveFromPlaylist} onShare={handleShare} onCreatePlaylist={onCreatePlaylist} onNavigateChannel={(channelId) => navigate(`/channel/${channelId}`)} activePlaylistId={activePlaylistId} />;
          })}
        </div>
      )}
      {title === "Home" && videos.length > 0 && <div className="mt-8 text-center text-sm text-secondary-custom">Showing {videos.length} of {allVideoCount} videos</div>}
    </div>
  );
}

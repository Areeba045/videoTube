// import { useEffect, useState } from "react";
// import { getWatchHistory } from "@/services/userApi";
// import { normalizeVideo } from "@/services/videoApi";
// import type { Playlist, User, Video } from "@/types";
// import VideoFeedPage from "@/pages/VideoFeedPage";
// import { feedIcons } from "@/pages/feedIcons";

// interface HistoryPageProps {
//   user: User | null;
//   playlists: Playlist[];
//   getUserById: (id: string) => User | undefined;
//   onSaveToPlaylist: (playlistId: string, videoId: string) => void;
//   onRemoveFromPlaylist: (playlistId: string, videoId: string) => void;
//   onCreatePlaylist: (name: string, description: string) => void;
// }

// export default function HistoryPage({
//   user,
//   playlists,
//   getUserById,
//   onSaveToPlaylist,
//   onRemoveFromPlaylist,
//   onCreatePlaylist,
// }: HistoryPageProps) {
//   const [videos, setVideos] = useState<Video[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!user) {
//       setVideos([]);
//       setLoading(false);
//       return;
//     }

//     let cancelled = false;
//     setLoading(true);
//     setError("");
//     getWatchHistory()
//       .then((response) => {
//         if (!cancelled)
//           setVideos(response.data.map((video) => normalizeVideo(video)));
//       })
//       .catch((requestError) => {
//         if (!cancelled)
//           setError(
//             requestError instanceof Error
//               ? requestError.message
//               : "Failed to load watch history",
//           );
//       })
//       .finally(() => {
//         if (!cancelled) setLoading(false);
//       });
//     return () => {
//       cancelled = true;
//     };
//   }, [user]);

//   if (!user)
//     return (
//       <div className="py-24 text-center text-sm text-secondary-custom">
//         Sign in to view your watch history.
//       </div>
//     );
//   if (loading)
//     return (
//       <div className="py-24 text-center text-sm text-secondary-custom">
//         Loading history...
//       </div>
//     );
//   if (error)
//     return <div className="py-24 text-center text-sm text-error">{error}</div>;

//   return (
//     <VideoFeedPage
//       title="History"
//       subtitle="Your recently watched videos"
//       icon={feedIcons.history}
//       videos={videos}
//       allVideoCount={videos.length}
//       getUserById={getUserById}
//       playlists={playlists}
//       emptyMessage="Videos you watch will appear here."
//       onSaveToPlaylist={onSaveToPlaylist}
//       onRemoveFromPlaylist={onRemoveFromPlaylist}
//       onCreatePlaylist={onCreatePlaylist}
//     />
//   );
// }

// import { useEffect, useState } from "react";
// import { getWatchHistory } from "@/services/userApi";
// import { normalizeVideo } from "@/services/videoApi";
// import type { Playlist, User, Video } from "@/types";
// import { feedIcons } from "@/pages/feedIcons";
// import { useNavigate } from "react-router-dom";

// interface HistoryPageProps {
//   user: User | null;
//   playlists: Playlist[];
//   getUserById: (id: string) => User | undefined;
//   onSaveToPlaylist: (playlistId: string, videoId: string) => void;
//   onRemoveFromPlaylist: (playlistId: string, videoId: string) => void;
//   onCreatePlaylist: (name: string, description: string) => void;
// }

// export default function HistoryPage({
//   user,
//   playlists,
//   getUserById,
//   onSaveToPlaylist,
//   onRemoveFromPlaylist,
//   onCreatePlaylist,
// }: HistoryPageProps) {
//   const [videos, setVideos] = useState<Video[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!user) {
//       setVideos([]);
//       setLoading(false);
//       return;
//     }

//     let cancelled = false;

//     setLoading(true);
//     setError("");

//     getWatchHistory()
//       .then((response) => {
//         if (!cancelled) {
//           setVideos(
//             response.data.map((video) =>
//               normalizeVideo(video)
//             )
//           );
//         }
//       })
//       .catch((requestError) => {
//         if (!cancelled) {
//           setError(
//             requestError instanceof Error
//               ? requestError.message
//               : "Failed to load watch history"
//           );
//         }
//       })
//       .finally(() => {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       });

//     return () => {
//       cancelled = true;
//     };
//   }, [user]);

//   // --------------------------------
//   // Get date key
//   // --------------------------------

//   const getDateKey = (dateString?: string) => {
//     if (!dateString) return "unknown";

//     const date = new Date(dateString);

//     if (Number.isNaN(date.getTime())) {
//       return "unknown";
//     }

//     return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
//   };

//   // --------------------------------
//   // Get section title
//   // Today / Yesterday / actual date
//   // --------------------------------

//   const getDayLabel = (dateString?: string) => {
//     if (!dateString) {
//       return "Watch history";
//     }

//     const date = new Date(dateString);

//     if (Number.isNaN(date.getTime())) {
//       return "Watch history";
//     }

//     const today = new Date();

//     const yesterday = new Date();
//     yesterday.setDate(today.getDate() - 1);

//     const dateKey = getDateKey(dateString);

//     if (dateKey === getDateKey(today.toISOString())) {
//       return "Today";
//     }

//     if (
//       dateKey ===
//       getDateKey(yesterday.toISOString())
//     ) {
//       return "Yesterday";
//     }

//     return date.toLocaleDateString(undefined, {
//       month: "long",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   // --------------------------------
//   // Watched time
//   // --------------------------------

//   const getWatchedText = (dateString?: string) => {
//     if (!dateString) return "";

//     const watchedDate = new Date(dateString);

//     if (Number.isNaN(watchedDate.getTime())) {
//       return "";
//     }

//     const now = new Date();

//     const difference =
//       now.getTime() - watchedDate.getTime();

//     const seconds = Math.floor(difference / 1000);
//     const minutes = Math.floor(seconds / 60);
//     const hours = Math.floor(minutes / 60);
//     const days = Math.floor(hours / 24);

//     if (seconds < 60) {
//       return "just now";
//     }

//     if (minutes < 60) {
//       return `${minutes} ${
//         minutes === 1 ? "minute" : "minutes"
//       } ago`;
//     }

//     if (hours < 24) {
//       return `${hours} ${
//         hours === 1 ? "hour" : "hours"
//       } ago`;
//     }

//     if (days === 1) {
//       return "yesterday";
//     }

//     return `${days} ${
//       days === 1 ? "day" : "days"
//     } ago`;
//   };

//   // --------------------------------
//   // Group videos by watched date
//   // --------------------------------

//   const groupedVideos = videos.reduce(
//     (groups, video) => {
//       const key = getDateKey(video.watchedAt);

//       if (!groups[key]) {
//         groups[key] = [];
//       }

//       groups[key].push(video);

//       return groups;
//     },
//     {} as Record<string, Video[]>
//   );

//   // --------------------------------
//   // Sort newest history first
//   // --------------------------------

//   const sortedGroups = Object.entries(
//     groupedVideos
//   ).sort(([keyA, videosA], [keyB, videosB]) => {
//     if (keyA === "unknown") return 1;
//     if (keyB === "unknown") return -1;

//     const dateA = videosA[0]?.watchedAt
//       ? new Date(
//           videosA[0].watchedAt
//         ).getTime()
//       : 0;

//     const dateB = videosB[0]?.watchedAt
//       ? new Date(
//           videosB[0].watchedAt
//         ).getTime()
//       : 0;

//     return dateB - dateA;
//   });

//   // --------------------------------
//   // UI states
//   // --------------------------------

//   if (!user) {
//     return (
//       <div className="py-24 text-center text-sm text-secondary-custom">
//         Sign in to view your watch history.
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="py-24 text-center text-sm text-secondary-custom">
//         Loading history...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="py-24 text-center text-error">
//         {error}
//       </div>
//     );
//   }

//   const HistoryIcon = feedIcons.history;

//   return (
//     <div className="animate-fade-in max-w-5xl">
//       {/* =========================
//           Header
//       ========================= */}

//       <div className="mb-10 flex items-center gap-3">
//         <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
//           <HistoryIcon className="w-5 h-5 text-primary" />
//         </div>

//         <div>
//           <h1 className="text-2xl font-bold text-primary-custom">
//             History
//           </h1>

//           <p className="text-sm text-secondary-custom mt-0.5">
//             Videos you’ve watched recently
//           </p>
//         </div>
//       </div>

//       {/* =========================
//           Empty State
//       ========================= */}

//       {videos.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-24 text-center">
//           <div className="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mb-4">
//             <HistoryIcon className="w-8 h-8 text-secondary-custom" />
//           </div>

//           <h3 className="text-lg font-semibold mb-1 text-primary-custom">
//             No videos here yet
//           </h3>

//           <p className="text-sm text-secondary-custom">
//             Videos you watch will appear here.
//           </p>
//         </div>
//       ) : (
//         /* =========================
//            History Sections
//         ========================= */

//         <div className="space-y-12">
//           {sortedGroups.map(
//             ([groupKey, groupVideos]) => (
//               <section key={groupKey}>
//                 {/* Section heading */}

//                 <div className="flex items-center gap-3 mb-5">
//                   <h2 className="text-lg font-semibold text-primary-custom">
//                     {getDayLabel(
//                       groupVideos[0]?.watchedAt
//                     )}
//                   </h2>

//                   <div className="h-px flex-1 bg-primary/10" />
//                 </div>

//                 {/* Video rows */}

//                 <div className="space-y-2">
//                   {groupVideos.map((video) => {
//                     const channel =
//                       video.owner ||
//                       getUserById(video.channelId);

//                     return (
//                       <div
//                         key={video.id}
//                         onClick={() =>
//                           navigate(
//                             `/watch/${video.id}`
//                           )
//                         }
//                         className="
//                           group
//                           flex
//                           gap-4
//                           p-3
//                           rounded-xl
//                           cursor-pointer
//                           transition-all
//                           duration-200
//                           hover:bg-elevated
//                         "
//                       >
//                         {/* =====================
//                             Thumbnail
//                         ===================== */}

//                         <div
//                           className="
//                             relative
//                             w-60
//                             sm:w-64
//                             md:w-72
//                             aspect-video
//                             flex-shrink-0
//                             overflow-hidden
//                             rounded-xl
//                             bg-elevated
//                           "
//                         >
//                           <img
//                             src={video.thumbnail}
//                             alt={video.title}
//                             className="
//                               w-full
//                               h-full
//                               object-cover
//                               transition-transform
//                               duration-300
//                               group-hover:scale-[1.03]
//                             "
//                           />

//                           {/* Duration */}

//                           {video.duration && (
//                             <span
//                               className="
//                                 absolute
//                                 bottom-2
//                                 right-2
//                                 rounded
//                                 bg-black/85
//                                 px-1.5
//                                 py-0.5
//                                 text-[11px]
//                                 font-medium
//                                 text-white
//                               "
//                             >
//                               {video.duration}
//                             </span>
//                           )}
//                         </div>

//                         {/* =====================
//                             Video information
//                         ===================== */}

//                         <div className="min-w-0 flex-1 py-1">
//                           {/* Title */}

//                           <h3
//                             className="
//                               text-base
//                               sm:text-lg
//                               font-semibold
//                               leading-snug
//                               text-primary-custom
//                               line-clamp-2
//                               group-hover:text-primary
//                               transition-colors
//                             "
//                           >
//                             {video.title}
//                           </h3>

//                           {/* Channel */}

//                           <p
//                             className="
//                               mt-2
//                               text-sm
//                               text-secondary-custom
//                               truncate
//                             "
//                           >
//                             {channel?.fullName ||
//                               channel?.username ||
//                               "Unknown channel"}
//                           </p>

//                           {/* Views • Category • Watched */}

//                           <p
//                             className="
//                               mt-1.5
//                               text-sm
//                               text-secondary-custom
//                               line-clamp-1
//                             "
//                           >
//                             {video.views.toLocaleString()} views
//                             {" • "}
//                             {video.category}
//                             {" • "}
//                             {getWatchedText(
//                               video.watchedAt
//                             )}
//                           </p>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </section>
//             )
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { MoreVertical, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getWatchHistory } from "@/services/userApi";
import {
  removeFromWatchHistory,
  clearWatchHistory,
} from "@/services/historyApi";
import { normalizeVideo } from "@/services/videoApi";

import type { Playlist, User, Video } from "@/types";
import { feedIcons } from "@/pages/feedIcons";

interface HistoryPageProps {
  user: User | null;
  playlists: Playlist[];
  getUserById: (id: string) => User | undefined;
  onSaveToPlaylist: (playlistId: string, videoId: string) => void;
  onRemoveFromPlaylist: (playlistId: string, videoId: string) => void;
  onCreatePlaylist: (name: string, description: string) => void;
}

/* ---------------- DATE HELPERS ---------------- */

const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const getDateKey = (dateString?: string) => {
  if (!dateString) return "unknown";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "unknown";
  }

  // Local date key
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const getDayLabel = (dateString?: string) => {
  if (!dateString) {
    return "Watch History";
  }

  const watchedDate = new Date(dateString);

  if (Number.isNaN(watchedDate.getTime())) {
    return "Watch History";
  }

  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(watchedDate, today)) {
    return "Today";
  }

  if (isSameDay(watchedDate, yesterday)) {
    return "Yesterday";
  }

  return watchedDate.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

/* ---------------- WATCHED TIME ---------------- */

const getWatchedText = (dateString?: string) => {
  if (!dateString) {
    return "watch time unavailable";
  }

  const watchedDate = new Date(dateString);

  if (Number.isNaN(watchedDate.getTime())) {
    return "watch time unavailable";
  }

  const now = new Date();

  const difference = now.getTime() - watchedDate.getTime();

  if (difference < 0) {
    return "just now";
  }

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  if (hours < 24) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  if (days === 1) {
    return "yesterday";
  }

  return `${days} ${days === 1 ? "day" : "days"} ago`;
};

/* ---------------- HISTORY PAGE ---------------- */

export default function HistoryPage({
  user,
  playlists,
  getUserById,
  onSaveToPlaylist,
  onRemoveFromPlaylist,
  onCreatePlaylist,
}: HistoryPageProps) {
  const navigate = useNavigate();

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [actionError, setActionError] = useState("");

  /* ---------------- FETCH HISTORY ---------------- */

  useEffect(() => {
    if (!user) {
      setVideos([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError("");

    getWatchHistory()
      .then((response) => {
        if (cancelled) return;

        /*
         * Keep watchedAt from the BACKEND response.
         *
         * This is important because normalizeVideo mainly
         * normalizes normal video information.
         */
        const normalizedVideos = response.data.map((video) => {
          const normalizedVideo = normalizeVideo(video);

          return {
            ...normalizedVideo,

            // Explicitly preserve watch-history timestamp
            watchedAt: video.watchedAt || "",
             historyId: video.historyId || "",
          };
        });

        console.log("WATCH HISTORY RESPONSE:", response.data);
        console.log("NORMALIZED HISTORY:", normalizedVideos);

        setVideos(normalizedVideos);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load watch history",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleRemoveFromHistory = async (historyId: string) => {
    try {
      setActionLoading(historyId);
      setActionError("");
      setActiveMenu(null);

      await removeFromWatchHistory(historyId);

      // Update the UI only after the backend succeeds.
      setVideos((currentVideos) =>
        currentVideos.filter((video) => video.historyId !== historyId),
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Failed to remove video from history",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearHistory = async () => {
    if (videos.length === 0 || clearingHistory) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear your entire watch history?",
    );

    if (!confirmed) return;

    try {
      setClearingHistory(true);
      setActionError("");
      setActiveMenu(null);

      await clearWatchHistory();

      // Clear the screen after the backend succeeds.
      setVideos([]);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Failed to clear watch history",
      );
    } finally {
      setClearingHistory(false);
    }
  };
  /* ---------------- NOT LOGGED IN ---------------- */

  if (!user) {
    return (
      <div className="py-24 text-center text-sm text-secondary-custom">
        Sign in to view your watch history.
      </div>
    );
  }

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="py-24 text-center text-sm text-secondary-custom">
        Loading history...
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */

  if (error) {
    return <div className="py-24 text-center text-error">{error}</div>;
  }

  /* ---------------- EMPTY ---------------- */

  if (videos.length === 0) {
    const HistoryIcon = feedIcons.history;

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <HistoryIcon className="h-7 w-7 text-primary" />
        </div>

        <h2 className="text-xl font-semibold text-primary-custom">
          No watch history yet
        </h2>

        <p className="mt-2 max-w-md text-sm text-secondary-custom">
          Videos you watch will appear here.
        </p>
      </div>
    );
  }

  /* ---------------- GROUP BY WATCH DATE ---------------- */

  const groupedVideos = videos.reduce(
    (groups, video) => {
      const key = getDateKey(video.watchedAt);

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(video);

      return groups;
    },
    {} as Record<string, Video[]>,
  );

  Object.values(groupedVideos).forEach((group) => {
  group.sort(
    (a, b) =>
      new Date(b.watchedAt || 0).getTime() -
      new Date(a.watchedAt || 0).getTime(),
  );
});
  /* ---------------- SORT GROUPS ---------------- */

  const sortedGroups = Object.entries(groupedVideos).sort(
    ([keyA, videosA], [keyB, videosB]) => {
      if (keyA === "unknown") return 1;
      if (keyB === "unknown") return -1;

      const dateA = videosA[0]?.watchedAt
        ? new Date(videosA[0].watchedAt).getTime()
        : 0;

      const dateB = videosB[0]?.watchedAt
        ? new Date(videosB[0].watchedAt).getTime()
        : 0;

      return dateB - dateA;
    },
  );

  /* ---------------- UI ---------------- */

  const HistoryIcon = feedIcons.history;

  console.log("WATCH HISTORY RESPONSE:", Response.data);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* PAGE HEADER */}
      {/* <div className="mb-10 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <HistoryIcon className="h-5 w-5 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-primary-custom">
            History
          </h1>

          <p className="mt-0.5 text-sm text-secondary-custom">
            Videos you’ve watched recently
          </p>
        </div>
      </div> */}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-elevated">
            <HistoryIcon className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-primary">History</h1>

            <p className="text-sm text-secondary">
              Videos you've watched recently
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClearHistory}
          disabled={videos.length === 0 || clearingHistory}
          className="inline-flex items-center gap-2 rounded-lg border border-default px-4 py-2 text-sm font-medium text-primary transition hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />

          {clearingHistory ? "Clearing..." : "Clear history"}
        </button>
      </div>

      {actionError && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          <span>{actionError}</span>

          <button
            type="button"
            onClick={() => setActionError("")}
            aria-label="Dismiss error"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {/* DATE GROUPS */}
      <div className="space-y-10">
        {sortedGroups.map(([dateKey, groupVideos]) => {
          const firstVideo = groupVideos[0];

          return (
            <section key={dateKey}>
              {/* DATE HEADING */}
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-lg font-semibold text-primary-custom">
                  {getDayLabel(firstVideo?.watchedAt)}
                </h2>

                <div className="h-px flex-1 bg-border-custom" />
              </div>

              {/* VIDEOS */}
              <div className="space-y-2">
                {groupVideos.map((video) => {
                  const channel = video.owner || getUserById(video.channelId);

                  return (
                    // <div
                    //   // key={video.id}
                    //   key={`${video.id}-${video.watchedAt}-${dateKey}`}
                    //   onClick={() =>
                    //     navigate(`/watch/${video.id}`)
                    //   }
                    //   className="group flex cursor-pointer gap-4 rounded-xl p-3 transition-all duration-200 hover:bg-elevated"
                    // >
                    <div
                      key={`${video.historyId}-${video.watchedAt}-${dateKey}`}
                      onClick={() => navigate(`/watch/${video.id}`)}
                      className="group relative flex cursor-pointer gap-4 rounded-xl p-3 transition-all duration-200 hover:bg-elevated"
                    >
                      {/* THUMBNAIL */}
                      <div className="relative aspect-video w-56 flex-shrink-0 overflow-hidden rounded-xl bg-elevated sm:w-64 md:w-72">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />

                        {/* VIDEO DURATION */}
                        {video.duration && (
                          <span className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-medium text-white">
                            {video.duration}
                          </span>
                        )}
                      </div>

                      {/* VIDEO INFORMATION */}
                      <div className="min-w-0 flex-1 py-1">
                        {/* TITLE */}
                        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-primary-custom transition-colors group-hover:text-primary sm:text-lg">
                          {video.title}
                        </h3>

                        {/* CHANNEL */}
                        <p className="mt-2 truncate text-sm text-secondary-custom">
                          {channel?.fullName ||
                            channel?.username ||
                            "Unknown channel"}
                        </p>

                        {/* VIDEO META */}
                        <p className="mt-1.5 line-clamp-1 text-sm text-secondary-custom">
                          {video.views.toLocaleString()} views
                          {/* {" • "}
                          {video.category} */}
                          {" • "}
                          {getWatchedText(video.watchedAt)}
                        </p>
                      </div>
                      <div
                        className="relative ml-auto shrink-0"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          aria-label="Video history options"
                          title="More options"
                          onClick={() =>
                            setActiveMenu((current) =>
                              current === video.historyId ? null : video.historyId,
                            )
                          }
                          className="rounded-full p-2 text-secondary transition hover:bg-elevated hover:text-primary"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>

                        {activeMenu === video.historyId && (
                          <div className="absolute right-0 top-10 z-20 w-52 overflow-hidden rounded-xl border border-default bg-background shadow-xl">
                            <button
                              type="button"
                              disabled={actionLoading === video.historyId}
                              onClick={() => handleRemoveFromHistory(video.historyId)}
                              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-primary transition hover:bg-elevated disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4 text-secondary" />

                              {actionLoading === video.historyId
                                ? "Removing..."
                                : "Remove from history"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

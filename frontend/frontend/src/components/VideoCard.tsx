// import { useState, useRef, useEffect } from 'react';
// import { MoreVertical, CheckCircle2, Bookmark, Share2, Flag, Trash2, Check, Plus, X } from 'lucide-react';
// import type { Video, User, Playlist } from '../types';
// import { formatViews } from '../utils/format';

// interface VideoCardProps {
//   video: Video;
//   // channel: User;
//   onPlay: (videoId: string) => void;
//   playlists: Playlist[];
//   onSaveToPlaylist: (playlistId: string, videoId: string) => void;
//   onRemoveFromPlaylist?: (playlistId: string, videoId: string) => void;
//   onShare?: (videoId: string) => void;
//   onCreatePlaylist?: (name: string) => void;
//   onNavigateChannel?: (channelId: string) => void;
//   activePlaylistId?: string | null;
// }

// export default function VideoCard({
//   video, onPlay, playlists, onSaveToPlaylist,
//   onRemoveFromPlaylist, onShare, onCreatePlaylist, onNavigateChannel,
//   activePlaylistId,
// }: VideoCardProps) {
//   const [showMenu, setShowMenu] = useState(false);
//   const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
//   const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
//   const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
//   const [newPlaylistName, setNewPlaylistName] = useState('');
//   const menuRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     function handleClickOutside(e: MouseEvent) {
//       if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
//         setShowMenu(false); setShowPlaylistMenu(false); setShowCreatePlaylist(false);
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const activePlaylist = activePlaylistId ? playlists.find((p) => p.id === activePlaylistId) : null;
//   const isInActivePlaylist = activePlaylist ? activePlaylist.videoIds.includes(video.id) : false;

//   const playlistContainsVideo = (plId: string) => {
//     const pl = playlists.find((p) => p.id === plId);
//     return pl ? pl.videoIds.includes(video.id) : false;
//   };

//   function handleShare() {
//     setShowMenu(false);
//     if (onShare) onShare(video.id);
//   }

//   function handleCreatePlaylist() {
//     if (newPlaylistName.trim() && onCreatePlaylist) {
//       onCreatePlaylist(newPlaylistName.trim());
//       setNewPlaylistName('');
//       setShowCreatePlaylist(false);
//     }
//   }

//   function handleChannelClick(e: React.MouseEvent) {
//   e.stopPropagation();

//   if (onNavigateChannel && video.channelId) {
//     onNavigateChannel(video.channelId);
//   }
// }

//   // function handleChannelClick(e: React.MouseEvent) {
//   //   e.stopPropagation();
//   //   if (onNavigateChannel) 
//   //     // onNavigateChannel(channel.id);
//   // }

//   return (
//     <div className="group cursor-pointer animate-fade-in" onClick={() => onPlay(video.id)}>
//       <div className="relative aspect-video rounded-xl overflow-hidden bg-card group-hover:rounded-lg transition-all duration-200">
//         <img src={video.thumbnail} alt={video.title}
//           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
//         <div className="absolute bottom-2 right-2 bg-black/85 text-white text-xs font-medium px-1.5 py-0.5 rounded">{video.duration}</div>
//         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
//       </div>

//       <div className="flex gap-3 mt-3 px-1">
//         {/* <img src={channel.avatar} alt={channel.name} onClick={handleChannelClick}
//           className="w-9 h-9 rounded-full shrink-0 mt-0.5 cursor-pointer hover:ring-2 hover:ring-primary transition-all" /> */}
//         <div className="flex-1 min-w-0">
//           <h3 className="font-semibold text-sm leading-snug line-clamp-2 transition-all duration-200 text-primary-custom">{video.title}</h3>
//           <div className="mt-1 flex items-center gap-1">
//             {/* <span onClick={handleChannelClick}
//               className="text-xs text-secondary-custom hover:text-primary transition-colors cursor-pointer">{channel.name}</span> */}
//               <span
//   onClick={handleChannelClick}
//   className="text-xs text-secondary-custom hover:text-primary transition-colors cursor-pointer"
// >
//   {video.owner?.fullName || video.owner?.username || "Unknown creator"}
// </span>
//             <CheckCircle2 className="w-3 h-3 text-secondary-custom" />
//           </div>
//           <div className="flex items-center gap-1 text-xs text-secondary-custom">
//             <span>{formatViews(video.views)} views</span><span>•</span><span>{video.uploadedText}</span>
//           </div>
//         </div>
//         <div className="relative" ref={menuRef}>
//           <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
//             className="p-1.5 rounded-full hover:bg-elevated transition-colors opacity-0 group-hover:opacity-100">
//             <MoreVertical className="w-4 h-4 text-secondary-custom" />
//           </button>
//           {showMenu && (
//             <div className="absolute right-0 top-8 w-56 bg-card rounded-xl shadow-xl border border-base overflow-hidden z-10 animate-scale-in"
//               onClick={(e) => e.stopPropagation()}>
//               {/* Save to playlist */}
//               <button onClick={(e) => { e.stopPropagation(); setShowPlaylistMenu(!showPlaylistMenu); }}
//                 className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-elevated transition-colors text-primary-custom">
//                 <Bookmark className="w-4 h-4" /> Save to Playlist
//               </button>
//               {showPlaylistMenu && (
//                 <div className="border-t border-base py-1 max-h-56 overflow-y-auto scrollbar-thin">
//                   {/* Create new playlist */}
//                   {onCreatePlaylist && !showCreatePlaylist && (
//                     <button onClick={(e) => { e.stopPropagation(); setShowCreatePlaylist(true); }}
//                       className="w-full flex items-center gap-3 px-8 py-2 text-xs hover:bg-elevated transition-colors text-primary font-medium">
//                       <Plus className="w-3.5 h-3.5" />
//                       <span className="flex-1 text-left">Create new playlist</span>
//                     </button>
//                   )}
//                   {showCreatePlaylist && (
//                     <div className="px-4 py-2 bg-elevated animate-slide-up" onClick={(e) => e.stopPropagation()}>
//                       <div className="flex items-center gap-2">
//                         <input type="text" value={newPlaylistName}
//                           onChange={(e) => setNewPlaylistName(e.target.value)}
//                           onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleCreatePlaylist(); } }}
//                           placeholder="Playlist name..."
//                           className="flex-1 bg-card border border-base rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary transition-colors text-primary-custom placeholder:text-secondary-custom"
//                           autoFocus />
//                         <button onClick={handleCreatePlaylist} className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary-700 transition-colors">
//                           <Check className="w-3 h-3" />
//                         </button>
//                         <button onClick={() => { setShowCreatePlaylist(false); setNewPlaylistName(''); }} className="p-1.5 rounded-lg hover:bg-hover transition-colors">
//                           <X className="w-3 h-3 text-secondary-custom" />
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                   {/* Existing playlists */}
//                   {playlists.map((pl) => {
//                     const alreadySaved = playlistContainsVideo(pl.id);
//                     return (
//                       <button key={pl.id}
//                         onClick={(e) => { e.stopPropagation(); if (!alreadySaved) { onSaveToPlaylist(pl.id, video.id); } setShowMenu(false); setShowPlaylistMenu(false); }}
//                         className={`w-full flex items-center gap-3 px-8 py-2 text-xs transition-colors text-primary-custom ${alreadySaved ? 'opacity-60 cursor-default' : 'hover:bg-elevated'}`}>
//                         <Bookmark className="w-3.5 h-3.5" />
//                         <span className="flex-1 text-left">{pl.name}</span>
//                         {alreadySaved && <Check className="w-3 h-3 text-success" />}
//                       </button>
//                     );
//                   })}
//                 </div>
//               )}
//               {/* Remove from playlist — with confirm */}
//               {isInActivePlaylist && onRemoveFromPlaylist && activePlaylistId && (
//                 <>
//                   <button onClick={(e) => { e.stopPropagation(); setShowRemoveConfirm(true); }}
//                     className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-error/10 hover:text-error transition-colors text-primary-custom">
//                     <Trash2 className="w-4 h-4" /> Remove from Playlist
//                   </button>
//                   {showRemoveConfirm && (
//                     <div className="border-t border-base p-3 bg-elevated animate-slide-up"
//                       onClick={(e) => e.stopPropagation()}>
//                       <p className="text-xs text-secondary-custom mb-2">Remove "{video.title.slice(0, 30)}..." from this playlist?</p>
//                       <div className="flex gap-2">
//                         <button onClick={(e) => { e.stopPropagation(); onRemoveFromPlaylist(activePlaylistId, video.id); setShowMenu(false); setShowRemoveConfirm(false); }}
//                           className="flex-1 px-3 py-1.5 rounded-lg bg-error text-white text-xs font-semibold hover:bg-error/80 transition-colors">
//                           Remove
//                         </button>
//                         <button onClick={(e) => { e.stopPropagation(); setShowRemoveConfirm(false); }}
//                           className="px-3 py-1.5 rounded-lg bg-card border border-base text-primary-custom text-xs font-medium hover:bg-hover transition-colors">
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}
//               {/* Share */}
//               <button onClick={handleShare}
//                 className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-elevated transition-colors text-primary-custom">
//                 <Share2 className="w-4 h-4" /> Share
//               </button>
//               <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
//                 className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-elevated transition-colors text-secondary-custom">
//                 <Flag className="w-4 h-4" /> Report
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState, useRef, useEffect } from "react";

import {
  MoreVertical,
  CheckCircle2,
  Bookmark,
  Share2,
  Flag,
  Trash2,
  Check,
  Plus,
  X,
} from "lucide-react";

import type { Video, Playlist } from "../types";
import { formatViews } from "../utils/format";

interface VideoCardProps {
  video: Video;

  onPlay: (videoId: string) => void;

  playlists: Playlist[];

  onSaveToPlaylist: (
    playlistId: string,
    videoId: string
  ) => void;

  onRemoveFromPlaylist?: (
    playlistId: string,
    videoId: string
  ) => void;

  onShare?: (videoId: string) => void;

  onCreatePlaylist?: (name: string) => void;

  onNavigateChannel?: (channelId: string) => void;

  activePlaylistId?: string | null;
}

export default function VideoCard({
  video,
  onPlay,
  playlists,
  onSaveToPlaylist,
  onRemoveFromPlaylist,
  onShare,
  onCreatePlaylist,
  onNavigateChannel,
  activePlaylistId,
}: VideoCardProps) {
  const [showMenu, setShowMenu] =
    useState(false);

  const [showPlaylistMenu, setShowPlaylistMenu] =
    useState(false);

  const [showRemoveConfirm, setShowRemoveConfirm] =
    useState(false);

  const [showCreatePlaylist, setShowCreatePlaylist] =
    useState(false);

  const [newPlaylistName, setNewPlaylistName] =
    useState("");

  const menuRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          e.target as Node
        )
      ) {
        setShowMenu(false);
        setShowPlaylistMenu(false);
        setShowCreatePlaylist(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const activePlaylist = activePlaylistId
    ? playlists.find(
        (playlist) =>
          playlist.id === activePlaylistId
      )
    : null;

  const isInActivePlaylist = activePlaylist
    ? activePlaylist.videoIds.includes(video.id)
    : false;

  const playlistContainsVideo = (
    playlistId: string
  ) => {
    const playlist = playlists.find(
      (item) => item.id === playlistId
    );

    return playlist
      ? playlist.videoIds.includes(video.id)
      : false;
  };

  function handleShare() {
    setShowMenu(false);

    if (onShare) {
      onShare(video.id);
    }
  }

  function handleCreatePlaylist() {
    if (
      newPlaylistName.trim() &&
      onCreatePlaylist
    ) {
      onCreatePlaylist(
        newPlaylistName.trim()
      );

      setNewPlaylistName("");
      setShowCreatePlaylist(false);
    }
  }

  function handleChannelClick(
    e: React.MouseEvent
  ) {
    e.stopPropagation();

    if (
      onNavigateChannel &&
      video.channelId
    ) {
      onNavigateChannel(video.channelId);
    }
  }

  const channelName =
    video.owner?.fullName ||
    video.owner?.username ||
    "Unknown creator";

  return (
    <div
      className="group cursor-pointer animate-fade-in"
      onClick={() => onPlay(video.id)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-card group-hover:rounded-lg transition-all duration-200">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        <div className="absolute bottom-2 right-2 bg-black/85 text-white text-xs font-medium px-1.5 py-0.5 rounded">
          {video.duration}
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>

      {/* Video information */}
      <div className="flex gap-3 mt-3 px-1">
        {/* Avatar */}
        <img
          src={
            video.owner?.avatar ||
            "/default-avatar.png"
          }
          alt={channelName}
          onClick={handleChannelClick}
          className="w-9 h-9 rounded-full shrink-0 mt-0.5 cursor-pointer hover:ring-2 hover:ring-primary transition-all object-cover"
        />

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 transition-all duration-200 text-primary-custom">
            {video.title}
          </h3>

          {/* Channel */}
          <div className="mt-1 flex items-center gap-1">
            <span
              onClick={handleChannelClick}
              className="text-xs text-secondary-custom hover:text-primary transition-colors cursor-pointer"
            >
              {channelName}
            </span>

            <CheckCircle2 className="w-3 h-3 text-secondary-custom" />
          </div>

          {/* Views + date */}
          <div className="flex items-center gap-1 text-xs text-secondary-custom">
            <span>
              {formatViews(video.views)} views
            </span>

            <span>•</span>

            <span>{video.uploadedText}</span>
          </div>
        </div>

        {/* Menu */}
        <div
          className="relative"
          ref={menuRef}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded-full hover:bg-elevated transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4 text-secondary-custom" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-8 w-56 bg-card rounded-xl shadow-xl border border-base overflow-hidden z-10 animate-scale-in"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {/* Save to playlist */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylistMenu(
                    !showPlaylistMenu
                  );
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-elevated transition-colors text-primary-custom"
              >
                <Bookmark className="w-4 h-4" />
                Save to Playlist
              </button>

              {showPlaylistMenu && (
                <div className="border-t border-base py-1 max-h-56 overflow-y-auto scrollbar-thin">
                  {/* Create playlist */}
                  {onCreatePlaylist &&
                    !showCreatePlaylist && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCreatePlaylist(
                            true
                          );
                        }}
                        className="w-full flex items-center gap-3 px-8 py-2 text-xs hover:bg-elevated transition-colors text-primary font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />

                        <span className="flex-1 text-left">
                          Create new playlist
                        </span>
                      </button>
                    )}

                  {/* Create playlist form */}
                  {showCreatePlaylist && (
                    <div
                      className="px-4 py-2 bg-elevated animate-slide-up"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={
                            newPlaylistName
                          }
                          onChange={(e) =>
                            setNewPlaylistName(
                              e.target.value
                            )
                          }
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter"
                            ) {
                              e.stopPropagation();
                              handleCreatePlaylist();
                            }
                          }}
                          placeholder="Playlist name..."
                          className="flex-1 bg-card border border-base rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary transition-colors text-primary-custom placeholder:text-secondary-custom"
                          autoFocus
                        />

                        <button
                          onClick={
                            handleCreatePlaylist
                          }
                          className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary-700 transition-colors"
                        >
                          <Check className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => {
                            setShowCreatePlaylist(
                              false
                            );
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
                  {playlists.map((playlist) => {
                    const alreadySaved =
                      playlistContainsVideo(
                        playlist.id
                      );

                    return (
                      <button
                        key={playlist.id}
                        onClick={(e) => {
                          e.stopPropagation();

                          if (!alreadySaved) {
                            onSaveToPlaylist(
                              playlist.id,
                              video.id
                            );
                          }

                          setShowMenu(false);
                          setShowPlaylistMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-8 py-2 text-xs transition-colors text-primary-custom ${
                          alreadySaved
                            ? "opacity-60 cursor-default"
                            : "hover:bg-elevated"
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />

                        <span className="flex-1 text-left">
                          {playlist.name}
                        </span>

                        {alreadySaved && (
                          <Check className="w-3 h-3 text-success" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Remove from playlist */}
              {isInActivePlaylist &&
                onRemoveFromPlaylist &&
                activePlaylistId && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRemoveConfirm(
                          true
                        );
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-error/10 hover:text-error transition-colors text-primary-custom"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove from Playlist
                    </button>

                    {showRemoveConfirm && (
                      <div
                        className="border-t border-base p-3 bg-elevated animate-slide-up"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <p className="text-xs text-secondary-custom mb-2">
                          Remove "
                          {video.title.slice(
                            0,
                            30
                          )}
                          ..." from this playlist?
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              onRemoveFromPlaylist(
                                activePlaylistId,
                                video.id
                              );

                              setShowMenu(false);
                              setShowRemoveConfirm(
                                false
                              );
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-error text-white text-xs font-semibold hover:bg-error/80 transition-colors"
                          >
                            Remove
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowRemoveConfirm(
                                false
                              );
                            }}
                            className="px-3 py-1.5 rounded-lg bg-card border border-base text-primary-custom text-xs font-medium hover:bg-hover transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

              {/* Share */}
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-elevated transition-colors text-primary-custom"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              {/* Report */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-elevated transition-colors text-secondary-custom"
              >
                <Flag className="w-4 h-4" />
                Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
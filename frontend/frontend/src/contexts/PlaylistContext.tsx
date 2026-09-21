import { createContext, useContext, useState } from "react";
import { playlists as initialPlaylists } from "@/data";
import type { Playlist } from "@/types";
import { api } from "@/utils/api";
import { useToast } from "@/components/Toast";

interface PlaylistContextValue {
  playlists: Playlist[];
  saveToPlaylist: (playlistId: string, videoId: string) => Promise<void>;
  removeFromPlaylist: (playlistId: string, videoId: string) => void;
  createPlaylist: (name: string) => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextValue | null>(null);

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists);

  async function saveToPlaylist(playlistId: string, videoId: string) {
    const playlist = playlists.find((item) => item.id === playlistId);
    if (playlist?.videoIds.includes(videoId)) {
      showToast("Already in this playlist", "info");
      return;
    }
    setPlaylists((current) => current.map((item) => item.id === playlistId && !item.videoIds.includes(videoId) ? { ...item, videoIds: [...item.videoIds, videoId] } : item));
    await api.saveToPlaylist(playlistId, videoId);
    showToast("Saved to playlist!");
  }

  function removeFromPlaylist(playlistId: string, videoId: string) {
    setPlaylists((current) => current.map((item) => item.id === playlistId ? { ...item, videoIds: item.videoIds.filter((id) => id !== videoId) } : item));
    showToast("Removed from playlist!", "info");
  }

  async function createPlaylist(name: string) {
    const playlist = await api.createPlaylist(name);
    if (playlist) {
      setPlaylists((current) => [...current, playlist]);
      showToast(`Playlist "${name}" created!`);
    }
  }

  return <PlaylistContext.Provider value={{ playlists, saveToPlaylist, removeFromPlaylist, createPlaylist }}>{children}</PlaylistContext.Provider>;
}

export function usePlaylists() {
  const context = useContext(PlaylistContext);
  if (!context) throw new Error("usePlaylists must be used inside PlaylistProvider");
  return context;
}

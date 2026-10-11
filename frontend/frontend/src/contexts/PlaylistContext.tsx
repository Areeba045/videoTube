import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { Playlist } from "@/types";

import {
  createPlaylist as createPlaylistApi,
  getUserPlaylist,
  getPlaylistById,
  addVideoToPlaylist as addVideoApi,
  removeVideoFromPlaylist as removeVideoApi,
  updatePlaylist as updatePlaylistApi,
  deletePlaylist as deletePlaylistApi,
  normalizePlaylist,
} from "@/services/playlistApi";

interface PlaylistContextType {
  playlists: Playlist[];
  loading: boolean;
  error: string | null;

  fetchUserPlaylists: (
    userId: string
  ) => Promise<void>;

  createPlaylist: (
    name: string,
    description : string 
  ) => Promise<void>;

  addVideoToPlaylist: (
    playlistId: string,
    videoId: string
  ) => Promise<void>;

  removeVideoFromPlaylist: (
    playlistId: string,
    videoId: string
  ) => Promise<void>;

  updatePlaylist: (
    playlistId: string,
    data: {
      name?: string;
      description?: string;
    }
  ) => Promise<void>;

  deletePlaylist: (
    playlistId: string
  ) => Promise<void>;
}

const PlaylistContext =
  createContext<PlaylistContextType | undefined>(
    undefined
  );

export function PlaylistProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [playlists, setPlaylists] =
    useState<Playlist[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // GET USER PLAYLISTS
  const fetchUserPlaylists = useCallback(
    async (userId: string) => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getUserPlaylist(userId);

        const normalizedPlaylists =
          (response.data || []).map(
            normalizePlaylist
          );

        setPlaylists(normalizedPlaylists);
      } catch (error: any) {
        console.error(
          "Failed to fetch playlists:",
          error
        );

        setError(
          error?.message ||
            "Failed to fetch playlists"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // CREATE PLAYLIST
  const createPlaylist = useCallback(
    async (name: string , description : string ) => {
      try {
        const response =
          await createPlaylistApi(name , description );

        const newPlaylist =
          normalizePlaylist(response.data);

        setPlaylists((previous) => [
          ...previous,
          newPlaylist,
        ]);
      } catch (error) {
        console.error(
          "Failed to create playlist:",
          error
        );

        throw error;
      }
    },
    []
  );

  // ADD VIDEO
  const addVideoToPlaylist = useCallback(
    async (
      playlistId: string,
      videoId: string
    ) => {
      try {
        const response =
          await addVideoApi(
            videoId,
            playlistId
          );

        const updatedPlaylist =
          normalizePlaylist(response.data);

        setPlaylists((previous) =>
          previous.map((playlist) =>
            playlist.id === playlistId
              ? updatedPlaylist
              : playlist
          )
        );
      } catch (error) {
        console.error(
          "Failed to add video:",
          error
        );

        throw error;
      }
    },
    []
  );

  // REMOVE VIDEO
  const removeVideoFromPlaylist =
    useCallback(
      async (
        playlistId: string,
        videoId: string
      ) => {
        try {
          const response =
            await removeVideoApi(
              videoId,
              playlistId
            );

          const updatedPlaylist =
            normalizePlaylist(response.data);

          setPlaylists((previous) =>
            previous.map((playlist) =>
              playlist.id === playlistId
                ? updatedPlaylist
                : playlist
            )
          );
        } catch (error) {
          console.error(
            "Failed to remove video:",
            error
          );

          throw error;
        }
      },
      []
    );

  // UPDATE PLAYLIST
  const updatePlaylist = useCallback(
    async (
      playlistId: string,
      data: {
        name?: string;
        description?: string;
      }
    ) => {
      try {
        const response =
          await updatePlaylistApi(
            playlistId,
            data
          );

        const updatedPlaylist =
          normalizePlaylist(response.data);

        setPlaylists((previous) =>
          previous.map((playlist) =>
            playlist.id === playlistId
              ? updatedPlaylist
              : playlist
          )
        );
      } catch (error) {
        console.error(
          "Failed to update playlist:",
          error
        );

        throw error;
      }
    },
    []
  );

  // DELETE PLAYLIST
  const deletePlaylist = useCallback(
    async (playlistId: string) => {
      try {
        await deletePlaylistApi(
          playlistId
        );

        setPlaylists((previous) =>
          previous.filter(
            (playlist) =>
              playlist.id !== playlistId
          )
        );
      } catch (error) {
        console.error(
          "Failed to delete playlist:",
          error
        );

        throw error;
      }
    },
    []
  );

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        loading,
        error,
        fetchUserPlaylists,
        createPlaylist,
        addVideoToPlaylist,
        removeVideoFromPlaylist,
        updatePlaylist,
        deletePlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylists() {
  const context =
    useContext(PlaylistContext);

  if (!context) {
    throw new Error(
      "usePlaylists must be used inside PlaylistProvider"
    );
  }

  return context;
}


// import {
//   createContext,
//   useCallback,
//   useContext,
//   useState,
//   type ReactNode,
// } from "react";

// import {
//   createPlaylist,
//   deletePlaylist,
//   updatePlaylist,
//   addVideoToPlaylist,
//   removeVideoFromPlaylist,
//   getPlaylistById,
//   getUserPlaylist,
// } from "@/services/playlistApi";

// import type { Playlist } from "@/services/playlistApi";

// interface PlaylistContextType {
//   playlists: Playlist[];
//   loading: boolean;
//   error: string | null;

//   fetchUserPlaylists: (userId: string) => Promise<void>;
// }

// const PlaylistContext = createContext<PlaylistContextType | undefined>(
//   undefined,
// );

// export function PlaylistProvider({ children }: { children: ReactNode }) {
//   const [playlists, setPlaylists] = useState<Playlist[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchUserPlaylists = useCallback(async (userId: string) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await getUserPlaylist(userId);

//       setPlaylists(response.data || []);
//     } catch (error: any) {
//       console.error("Failed to fetch playlists:", error);

//       setError(error?.message || "Failed to fetch playlists");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   return (
//     <PlaylistContext.Provider
//       value={{
//         playlists,
//         loading,
//         error,
//         fetchUserPlaylists,
//       }}
//     >
//       {children}
//     </PlaylistContext.Provider>
//   );
// }

// export function usePlaylists() {
//   const context = useContext(PlaylistContext);

//   if (!context) {
//     throw new Error("usePlaylists must be used inside PlaylistProvider");
//   }

//   return context;
// }

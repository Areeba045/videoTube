import { useState, useMemo, useCallback, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import UploadModal from "@/components/UploadModal";
import AuthModal from "@/components/AuthModal";
import ChannelPage from "@/pages/ChannelPage";
import SettingsPage from "@/pages/SettingsPage";
import SubscriptionsPage from "@/pages/SubscriptionsPage";
import HomePage from "@/pages/HomePage";
import HistoryPage from "@/pages/HistoryPage";
import LibraryPage from "@/pages/LibraryPage";
import VideoDetailPage from "@/pages/VideoDetailPage";
import { ToastProvider, useToast } from "@/components/Toast";
import { ThemeProvider } from "@/components/ThemeProvider";

import type { User, Privacy } from "@/types";
import { logoutUser, getCurrentUser } from "./services/userApi";
import { PlaylistProvider, usePlaylists } from "@/contexts/PlaylistContext";
import { useVideos, VideoProvider } from "@/contexts/VideoContext";
import {
  SubscriptionProvider,
  useSubscriptions,
} from "./contexts/SubscriptionContext";
import { LikeProvider, useLike } from "./contexts/likeContext";
import { CommentProvider } from "./contexts/CommentsContext";

function AppContent() {
  const {
    playlists,
    createPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    fetchUserPlaylists,
    updatePlaylist,
    deletePlaylist,
  } = usePlaylists();

  const { likedVideos, loadLikedVideos } = useLike();
  const { showToast } = useToast();
  const { publishVideo, deleteVideo } = useVideos();
  const { fetchSubscribedChannels, clearSubscriptions } = useSubscriptions();

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [defaultPublishPrivacy, setDefaultPublishPrivacy] =
    useState<Privacy>("public");

  const currentUser = authUser;

  const handleCreatePlaylist = async (
    name: string,
    description: string,
  ) => {
    try {
      await createPlaylist(name, description);
      showToast("Playlist created successfully!");
    } catch (error) {
      console.error("Create playlist error:", error);
      showToast("Failed to create playlist", "error");
    }
  };

  const handleSaveToPlaylist = async (
    playlistId: string,
    videoId: string,
  ) => {
    try {
      await addVideoToPlaylist(playlistId, videoId);
      showToast("Video saved to playlist!");
    } catch (error) {
      console.error("Save video error:", error);
      showToast("Failed to save video", "error");
    }
  };

  const handleRemoveFromPlaylist = async (
    playlistId: string,
    videoId: string,
  ) => {
    try {
      await removeVideoFromPlaylist(playlistId, videoId);
      showToast("Video removed from playlist", "info");
    } catch (error) {
      console.error("Remove video error:", error);
      showToast("Failed to remove video", "error");
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!cancelled) setAuthUser(user);
      } catch {
        if (!cancelled) setAuthUser(null);
      }
    };

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!currentUser?.id) {
      clearSubscriptions();
      return;
    }

    void fetchSubscribedChannels();
  }, [currentUser, fetchSubscribedChannels, clearSubscriptions]);

  // The mock `users` array was removed, so only the authenticated user
  // is available here. Backend responses should provide video/channel owner
  // details for other users.
  const allUsers = useMemo(
    () => (currentUser ? [currentUser] : []),
    [currentUser],
  );

  useEffect(() => {
    if (!currentUser?.id) return;
    void fetchUserPlaylists(currentUser.id);
  }, [currentUser, fetchUserPlaylists]);

  useEffect(() => {
    if (!currentUser?.id) return;
    void loadLikedVideos();
  }, [currentUser, loadLikedVideos]);

  const getUserById = useCallback(
    (id: string) => allUsers.find((user) => user?.id === id),
    [allUsers],
  );

  const handleAuth = (user: User) => {
    setAuthUser(user);
    setShowAuthModal(false);
    showToast(`Welcome, ${ user.name || "back"}!`);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setAuthUser(null);
      clearSubscriptions();
      showToast("Signed out successfully", "info");
    } catch (error) {
      console.error("Logout error:", error);
      showToast("Logout failed. Please try again.", "error");
    }
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed((collapsed) => !collapsed);
    } else {
      setSidebarOpen((open) => !open);
    }
  };

  const likedVideoIds = useMemo(() => {
    return new Set(
      (likedVideos || [])
        .map((item: any) => item?.video?._id || item?.video?.id || item?._id)
        .filter(Boolean)
        .map(String),
    );
  }, [likedVideos]);

  return (
    <div className="min-h-screen bg-base">
      <Header
        user={authUser}
        onUploadClick={() => {
          if (!authUser) {
            setShowAuthModal(true);
            return;
          }
          setShowUploadModal(true);
        }}
        onAuthClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onToggleSidebar={handleToggleSidebar}
      />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} isCollapsed={sidebarCollapsed} />

        <main className="min-w-0 flex-1 p-4 lg:p-6">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  user={currentUser}
                  playlists={playlists}
                  onSaveToPlaylist={handleSaveToPlaylist}
                  onRemoveFromPlaylist={handleRemoveFromPlaylist}
                  onCreatePlaylist={handleCreatePlaylist}
                />
              }
            />

            <Route
              path="/watch/:videoId"
              element={
                <VideoDetailPage
                  currentUser={currentUser}
                  playlists={playlists}
                  getUserById={getUserById}
                  onSaveToPlaylist={handleSaveToPlaylist}
                  onCreatePlaylist={handleCreatePlaylist}
                />
              }
            />

            <Route
              path="/history"
              element={
                <HistoryPage
                  user={currentUser}
                  playlists={playlists}
                  getUserById={getUserById}
                  onSaveToPlaylist={handleSaveToPlaylist}
                  onRemoveFromPlaylist={handleRemoveFromPlaylist}
                  onCreatePlaylist={handleCreatePlaylist}
                />
              }
            />

            <Route
              path="/subscriptions"
              element={<SubscriptionsPage currentUser={currentUser} />}
            />

            <Route
              path="/settings"
              element={
                currentUser ? (
                  <SettingsPage
                    user={currentUser}
                    onDefaultPublishPrivacy={setDefaultPublishPrivacy}
                    defaultPublishPrivacy={defaultPublishPrivacy}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            <Route
              path="/channel/:channelId"
              element={
                <ChannelPage
                  channel={currentUser}
                  currentUser={currentUser}
                  isSubscribed={false}
                  onDeleteVideo={deleteVideo}
                  onUploadClick={
                    currentUser
                      ? () => setShowUploadModal(true)
                      : undefined
                  }
                />
              }
            />

            <Route
              path="/library"
              element={
                <LibraryPage
                  mode="library"
                  likedVideoIds={likedVideoIds}
                  playlists={playlists}
                  getUserById={getUserById}
                  onSaveToPlaylist={handleSaveToPlaylist}
                  onRemoveFromPlaylist={handleRemoveFromPlaylist}
                  onCreatePlaylist={handleCreatePlaylist}
                  onDeletePlaylist={deletePlaylist}
                  onUpdatePlaylist={updatePlaylist}
                />
              }
            />

            <Route
              path="/liked"
              element={
                <LibraryPage
                  mode="liked"
                  likedVideoIds={likedVideoIds}
                  playlists={playlists}
                  getUserById={getUserById}
                  onSaveToPlaylist={handleSaveToPlaylist}
                  onRemoveFromPlaylist={handleRemoveFromPlaylist}
                  onCreatePlaylist={handleCreatePlaylist}
                  onDeletePlaylist={deletePlaylist}
                  onUpdatePlaylist={updatePlaylist}
                />
              }
            />

            <Route
              path="/playlist/:playlistId"
              element={
                <LibraryPage
                  mode="playlist"
                  likedVideoIds={likedVideoIds}
                  playlists={playlists}
                  getUserById={getUserById}
                  onSaveToPlaylist={handleSaveToPlaylist}
                  onRemoveFromPlaylist={handleRemoveFromPlaylist}
                  onCreatePlaylist={handleCreatePlaylist}
                  onDeletePlaylist={deletePlaylist}
                  onUpdatePlaylist={updatePlaylist}
                />
              }
            />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </main>
      </div>

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          // onPublish={async (data) => {
          //   if (!currentUser) return;
          //   await publishVideo(data);
          //   setShowUploadModal(false);
          // }}
          defaultPrivacy={defaultPublishPrivacy}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuth={handleAuth}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <PlaylistProvider>
            <SubscriptionProvider>
              <LikeProvider>
                <CommentProvider>
                  <VideoProvider>
                    <AppContent />
                  </VideoProvider>
                </CommentProvider>
              </LikeProvider>
            </SubscriptionProvider>
          </PlaylistProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

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
import { users, currentUser as mockCurrentUser } from "@/data";
import type { User, Privacy } from "@/types";
import { logoutUser, getCurrentUser } from "./services/userApi.ts";
import { PlaylistProvider } from "@/contexts/PlaylistContext";
import { usePlaylists } from "@/contexts/PlaylistContext";
import { useVideos, VideoProvider } from "@/contexts/VideoContext";

function AppContent() {
  const { showToast } = useToast();
  const { playlists, saveToPlaylist, removeFromPlaylist, createPlaylist } =
    usePlaylists();
  const { publishVideo, deleteVideo } = useVideos();
  const handleSaveToPlaylist = saveToPlaylist;
  const handleRemoveFromPlaylist = removeFromPlaylist;
  const handleCreatePlaylist = createPlaylist;
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [likedVideos] = useState<Set<string>>(new Set(["v3", "v6"]));
  const [defaultPublishPrivacy, setDefaultPublishPrivacy] =
    useState<Privacy>("public");

  useEffect(() => {
    const loadUser = async () => {
      try {
        setAuthUser(await getCurrentUser());
      } catch {
        setAuthUser(null);
      }
    };

    loadUser();
  }, []);

  const currentUser = authUser;
  const allUsers = useMemo(
    () => [...(currentUser ? [currentUser] : []), ...users],
    [currentUser],
  );

  const getUserById = useCallback(
    (id: string) => allUsers.find((u) => u?.id === id),
    [allUsers],
  );

  const handleAuth = (user: User) => {
    console.log("AUTH USER : ", user);
    setAuthUser(user);
    setShowAuthModal(false);
    showToast(`Welcome, ${user.name}!`);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();

      setAuthUser(null);

      showToast("Signed out successfully", "info");
    } catch (error) {
      console.error("LOGOUT ERROR : ", error);
      showToast("Logout failed. Please try again.", "error");
    }
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

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

        <main className="flex-1 min-w-0 p-4 lg:p-6">
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
                currentUser ? (
                  <VideoDetailPage
                    currentUser={currentUser}
                    playlists={playlists}
                    getUserById={getUserById}
                    onSaveToPlaylist={handleSaveToPlaylist}
                    onCreatePlaylist={handleCreatePlaylist}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
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
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
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
                  channel={currentUser || mockCurrentUser}
                  // videos={[]}
                  currentUser={currentUser}
                  isSubscribed={false}
                  onDeleteVideo={deleteVideo}
                  onUploadClick={
                    currentUser ? () => setShowUploadModal(true) : undefined
                  }
                />
              }
            />
            <Route
              path="/library"
              element={
                <LibraryPage
                  mode="library"
                  likedVideoIds={likedVideos}
                  playlists={playlists}
                  getUserById={getUserById}
                  onSaveToPlaylist={handleSaveToPlaylist}
                  onRemoveFromPlaylist={handleRemoveFromPlaylist}
                  onCreatePlaylist={handleCreatePlaylist}
                />
              }
            />
            <Route
              path="/liked"
              element={
                <LibraryPage
                  mode="liked"
                  likedVideoIds={likedVideos}
                  playlists={playlists}
                  getUserById={getUserById}
                  onSaveToPlaylist={handleSaveToPlaylist}
                  onRemoveFromPlaylist={handleRemoveFromPlaylist}
                  onCreatePlaylist={handleCreatePlaylist}
                />
              }
            />
            <Route
              path="/playlist/:playlistId"
              element={
                <LibraryPage
                  mode="playlist"
                  likedVideoIds={likedVideos}
                  playlists={playlists}
                  getUserById={getUserById}
                  onSaveToPlaylist={handleSaveToPlaylist}
                  onRemoveFromPlaylist={handleRemoveFromPlaylist}
                  onCreatePlaylist={handleCreatePlaylist}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onPublish={async (data) => {
            if (!currentUser) return;
            await publishVideo(data);

            setShowUploadModal(false);
          }}
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
            <VideoProvider>
              <AppContent />
            </VideoProvider>
          </PlaylistProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

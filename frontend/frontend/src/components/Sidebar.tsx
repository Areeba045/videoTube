import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Rss, Library, ThumbsUp, History, Bookmark, Plus, X } from 'lucide-react';
import { usePlaylists } from '@/contexts/PlaylistContext';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
}

const navItems = [
  { id: 'home' as const, label: 'Home', icon: Home },
  { id: 'subscriptions' as const, label: 'Subscriptions', icon: Rss },
  { id: 'library' as const, label: 'Library', icon: Library },
  { id: 'liked' as const, label: 'Liked Videos', icon: ThumbsUp },
  { id: 'history' as const, label: 'History', icon: History },
];

export default function Sidebar({ isOpen, isCollapsed }: SidebarProps) {
  const { playlists, createPlaylist } = usePlaylists();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.split('/').filter(Boolean);
  const activeView = path[0] || 'home';
  const activePlaylistId = path[0] === 'playlist' ? path[1] : null;
  const onNavigate = (view: string, playlistId?: string) => navigate(view === 'home' ? '/' : view === 'playlist' ? `/playlist/${playlistId}` : `/${view}`);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  function handleCreate() {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateForm(false);
    }
  }

  // Collapsed rail (desktop only)
  if (isCollapsed && !isOpen) {
    return (
      <aside className="hidden lg:flex sticky top-16 left-0 z-30 w-20 h-[calc(100vh-4rem)] bg-base border-r border-base flex-col items-center py-3 gap-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)}
              className={`w-16 flex flex-col items-center gap-1 px-1 py-3 rounded-lg text-xs transition-all ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-elevated text-secondary-custom'}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-tight text-center">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </aside>
    );
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden animate-fade-in" onClick={() => navigate(location.pathname)} />
      )}

      <aside className={`fixed lg:sticky top-16 left-0 z-30 w-60 h-[calc(100vh-4rem)] bg-base border-r border-base overflow-y-auto scrollbar-thin transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-elevated text-secondary-custom'}`}>
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-base p-3">
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary-custom">Playlists</h3>
            <button onClick={() => setShowCreateForm(!showCreateForm)}
              className="p-1 rounded-full hover:bg-elevated transition-colors" aria-label="Create playlist">
              <Plus className="w-4 h-4 text-secondary-custom" />
            </button>
          </div>

          {showCreateForm && (
            <div className="px-3 mb-2 flex items-center gap-2 animate-slide-up">
              <input type="text" value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Playlist name..."
                className="flex-1 bg-card border border-base rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary transition-colors text-primary-custom placeholder:text-secondary-custom"
                autoFocus />
              <button onClick={handleCreate} className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary-700 transition-colors">
                <Plus className="w-3 h-3" />
              </button>
              <button onClick={() => setShowCreateForm(false)} className="p-1.5 rounded-lg hover:bg-elevated transition-colors">
                <X className="w-3 h-3 text-secondary-custom" />
              </button>
            </div>
          )}

          <div className="space-y-1">
            {playlists.map((pl) => {
              const isActive = activeView === 'playlist' && activePlaylistId === pl.id;
              return (
                <button key={pl.id} onClick={() => onNavigate('playlist', pl.id)}
                  className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-elevated text-secondary-custom'}`}>
                  <Bookmark className={`w-5 h-5 shrink-0 ${isActive ? 'fill-primary' : ''}`} />
                  <span className="flex-1 text-left truncate">{pl.name}</span>
                  <span className="text-xs text-secondary-custom">{pl.videoIds.length}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-base p-4">
          <p className="text-xs text-secondary-custom leading-relaxed">
            © 2026 VideoTube, Inc.<br />A video sharing platform built with Express API.
          </p>
        </div>
      </aside>
    </>
  );
}

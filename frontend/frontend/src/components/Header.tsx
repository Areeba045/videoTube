import { useState, useRef, useEffect } from "react";
import {
  Search,
  Video as VideoIcon,
  Menu,
  Plus,
  LogIn,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import type { User } from "../types";
import { useNavigate, useSearchParams } from "react-router-dom";

interface HeaderProps {
  user: User | null;
  onUploadClick: () => void;
  onAuthClick: () => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export default function Header({
  user,
  onUploadClick,
  onAuthClick,
  onLogout,
  onToggleSidebar,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(
      searchInput.trim()
        ? `/?q=${encodeURIComponent(searchInput.trim())}`
        : "/",
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-base">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6 gap-4">
        {/* Left: Logo + Sidebar toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-full hover:bg-elevated transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer select-none">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <VideoIcon className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block text-primary-custom">
              Video<span className="text-primary">Tube</span>
            </span>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-2xl flex items-center">
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 flex items-center gap-2"
          >
            <div className="flex-1 flex items-center bg-elevated border border-base rounded-full h-10 px-4 focus-within:border-primary transition-all duration-200">
              <Search className="w-4 h-4 text-secondary-custom shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (e.target.value === "" && searchQuery !== "") {
                    navigate("/");
                  }
                }}
                placeholder="Search videos, channels..."
                className="flex-1 bg-transparent border-none outline-none px-3 text-sm placeholder:text-secondary-custom text-primary-custom"
              />
            </div>
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full hover:bg-elevated transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {user ? (
            <>
              {/* Upload button */}
              <button
                onClick={onUploadClick}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-full hover:bg-primary-700 transition-colors text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:block">Upload Video</span>
              </button>

              {/* User avatar */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-primary transition-all"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-primary flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-base overflow-hidden animate-scale-in">
                    <div className="p-4 border-b border-base flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-sm text-primary-custom">
                          {user?.name}
                        </p>
                        <p className="text-xs text-secondary-custom">
                          {user?.handle}
                        </p>
                      </div>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate(`/channel/${user.id}`);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-elevated transition-colors text-primary-custom"
                      >
                        Your channel
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/settings");
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-elevated transition-colors text-primary-custom"
                      >
                        Settings
                      </button>
                    </div>
                    <div className="border-t border-base py-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-elevated transition-colors text-primary"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={onAuthClick}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-full hover:bg-primary-700 transition-colors text-sm font-semibold"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

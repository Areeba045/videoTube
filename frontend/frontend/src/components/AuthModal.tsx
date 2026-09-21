import { useState } from "react";
import {
  X,
  Video as VideoIcon,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  Image as ImageIcon,
  AtSign,
} from "lucide-react";
import type { User } from "../types";
import { registerUser, loginUser, getCurrentUser } from "../services/userApi";

interface AuthModalProps {
  onClose: () => void;
  onAuth: (user: User) => void;
}

export default function AuthModal({ onClose, onAuth }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarName, setAvatarName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "register") {
      if (!name.trim()) {
        setError("Please enter your full name");
        return;
      }
      if (!username.trim()) {
        setError("Please enter a username");
        return;
      }
    }
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        const response = await loginUser(email, password);

        console.log("LOGIN RESPONSE:", response);
        const user = await getCurrentUser();

        console.log("CURRENT USER : ", user);

        onAuth(user);
      } else {
        const formData = new FormData();

        formData.append("fullName", name);
        formData.append("username", username);
        formData.append("email", email);
        formData.append("password", password);

        if (avatar) {
          formData.append("avatar", avatar);
        }

        const response = await registerUser(formData);

        console.log("REGISTER RESPNSE : ", response);

        const loginResponse = await loginUser(email, password);

        console.log("LOGIN AFTER REGISTER:", loginResponse);

        const userResponse = await getCurrentUser();

        console.log("CURRENT USER AFTER REGISTER:", userResponse);
        onAuth(userResponse);
      }
    } catch (error) {
      console.log("AUTH ERROR  : ", error);
      setError("LOGIN FAILED. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in border"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
          color: "var(--text-primary)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--border-color)" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <VideoIcon className="w-4 h-4 text-white" fill="white" />
            </div>
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {mode === "login" ? "Sign In" : "Create Account"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-opacity-10 transition-colors"
            style={{ backgroundColor: "transparent" }}
          >
            <X className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jordan Reyes"
                    className="w-full border rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Username
                </label>
                <div className="relative">
                  <AtSign
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="jordanreyes"
                    className="w-full border rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Avatar
                </label>
                <label
                  className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed hover:border-primary transition-colors cursor-pointer"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <ImageIcon
                    className="w-4 h-4"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {avatarName ? avatarName : "Upload avatar image (optional)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];

                      if (f) {
                        setAvatar(f);
                        setAvatarName(f.name);
                      }
                    }}
                  />
                </label>
              </div>
            </>
          )}

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--text-secondary)" }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@example.com"
                className="w-full border rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--text-secondary)" }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-error animate-slide-up">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {mode === "login" ? "Signing in..." : "Creating account..."}
              </>
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>

          <p
            className="text-center text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              className="text-primary font-semibold hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

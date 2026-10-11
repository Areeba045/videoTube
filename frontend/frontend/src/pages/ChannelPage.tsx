import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useVideos } from "../contexts/VideoContext.tsx";
import {
  CheckCircle2,
  Users,
  Video as VideoIcon,
  Trash2,
  Pencil,
  X,
  Check,
  Upload,
  Mail,
  Image as ImageIcon,
  Film,
} from "lucide-react";
import type { User, Video } from "@/types";
import { formatViews, formatSubscribers } from "@/utils/format";
import { getChannelProfile, normalizeUser } from "@/services/userApi";
import { useToast } from "@/components/Toast";
import { useSubscriptions } from "@/contexts/subscriptionContext.tsx";

interface ChannelPageProps {
  channel: User | null;
  currentUser: User | null;
  onUploadClick?: () => void;
  onDeleteVideo?: (videoId: string) => void;
}

export default function ChannelPage({
  channel,
  currentUser,
  onDeleteVideo,
  onUploadClick,
}: ChannelPageProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { channelId } = useParams<{ channelId: string }>();
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editThumbnail, setEditThumbnail] = useState<File | null>(null);
  const [editThumbnailName, setEditThumbnailName] = useState<string | null>(
    null,
  );
  const [editVideoName, setEditVideoName] = useState<string | null>(null);
  const [editVideo, setEditVideo] = useState<File | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [displayedChannel, setDisplayedChannel] = useState<User | null>(
    currentUser || channel,
  );


  const {
    toggleSubscription: toggleSubscriptionContext,
    isSubscribed,
    subscriberCounts,
    fetchSubscriberCount,
  } = useSubscriptions();
  const {
    video: allVideos,
    myVideos,
    updateVideo,
    deleteVideo,
    togglePublish,
  } = useVideos();


  const isOwner =
    !!currentUser &&
    !!displayedChannel &&
    currentUser.id === displayedChannel.id;

  

  useEffect(() => {
    if (!displayedChannel?.id) return;

    fetchSubscriberCount(displayedChannel.id);
  }, [displayedChannel?.id, fetchSubscriberCount]);

  async function toggleSubscription() {
    if (!displayedChannel) return;

    try {
      const next = await toggleSubscriptionContext(displayedChannel.id);

      showToast(
        next ? "Subscribed!" : "Unsubscribed",
        next ? "success" : "info",
      );
    } catch (error) {
      console.error("Subscription failed:", error);

      showToast("Failed to update subscription", "error");
    }
  }
  useEffect(() => {
    if (!channelId) return;
    if (currentUser?.id === channelId) {
      setDisplayedChannel(currentUser);
      return;
    }

    getChannelProfile(channelId)
      .then((response) => {
        setDisplayedChannel(normalizeUser(response.data));
      })
      .catch((error) => {
        console.error("Failed to load channel:", error);
        setDisplayedChannel(null);
      });
  }, [channelId, currentUser]);

  console.log("========== CHANNEL DEBUG ==========");

  console.log("displayedChannel:", displayedChannel);

  console.log("displayedChannel.id:", displayedChannel?.id);

  console.log("videos from props:", allVideos);

  console.log(
    "video channel IDs:",
    allVideos.map((video) => ({
      title: video.title,
      videoId: video.id,
      channelId: video.channelId,
      owner: video.owner,
    })),
  );

  //IMPORTANT
  // DO NOT CALCULATE DISPLAYED VIDEOS UNTIL DISPLAYED CHANNEL EXISTS
  if (!displayedChannel) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-secondary-custom">Loading channel....</p>
      </div>
    );
  }

  const displayedVideos = isOwner
    ? myVideos
    : allVideos.filter(
        (video) =>
          video.channelId === displayedChannel.id && video.privacy === "public",
      );
 

  console.log("FINAL displayedVideos:", displayedVideos);


  function startEdit(video: Video) {
    setEditingVideoId(video.id);
    setEditTitle(video.title);
    setEditDescription(video.description);
    setEditThumbnail(null);
    setEditThumbnailName(null);
    setEditVideoName(null);
    setEditVideo(null);
  }

  async function saveEdit() {
    if (!editingVideoId) {
      return;
    }
    try {
      await updateVideo(editingVideoId, {
        title: editTitle,
        description: editDescription,

        ...(editThumbnail ? { thumbnail: editThumbnail } : {}),

        ...(editVideo ? { video: editVideo } : {}),
      });

      setEditingVideoId(null);

      setEditThumbnail(null);
      setEditVideo(null);
      setEditThumbnailName(null);
      setEditVideoName(null);
    } catch (error) {
      console.error("Update failed: ", error);
    }

  }
  return (
    <div className="animate-fade-in">
      <div className="relative h-32 sm:h-44 lg:h-52 rounded-2xl overflow-hidden bg-elevated">
        {displayedChannel.coverImage ? (
          <img
            src={displayedChannel.coverImage}
            alt={displayedChannel.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/15 via-elevated to-base" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 px-1">
        <img
          src={displayedChannel.avatar}
          alt={displayedChannel.name}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-2 ring-base shrink-0 shadow-md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-primary-custom">
              {displayedChannel.name}
            </h1>
            <CheckCircle2 className="w-4 h-4 text-secondary-custom shrink-0" />
          </div>
          {displayedChannel.email && (
            <p className="text-sm text-secondary-custom flex items-center gap-1 mt-0.5">
              <Mail className="w-3.5 h-3.5" /> {displayedChannel.email}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-xs sm:text-sm text-secondary-custom">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {formatSubscribers(subscriberCounts[displayedChannel.id] ?? 0)}{" "}
              subscribers
            </span>
            <span className="flex items-center gap-1">
              <VideoIcon className="w-3.5 h-3.5" />
              {displayedVideos.length} videos
            </span>
          </div>
        </div>
        {isOwner ? (
          onUploadClick && (
            <button
              onClick={onUploadClick}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full hover:bg-primary-700 transition-colors text-sm font-semibold shadow-md shrink-0"
            >
              <Upload className="w-4 h-4" />
              Upload Video
            </button>
          )
        ) : (
          <button
            onClick={toggleSubscription}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-md shrink-0 ${isSubscribed(displayedChannel.id) ? "bg-elevated text-primary-custom hover:bg-hover" : "bg-primary text-white hover:bg-primary-700"} `}
          >
            {isSubscribed(displayedChannel.id) ? "Unsubscribe" : "Subscribe"}
          </button>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-bold mb-4 text-primary-custom">
          {isOwner ? "Your Videos" : "Videos"}
        </h2>
        {displayedVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mb-4">
              <VideoIcon className="w-8 h-8 text-secondary-custom" />
            </div>
            <p className="text-sm text-secondary-custom">
              {isOwner
                ? "You haven't uploaded any videos yet."
                : "No videos yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-6">
            {displayedVideos.map((video) => (
              <div key={video.id} className="group animate-fade-in">
                <div
                  className="relative aspect-video rounded-xl overflow-hidden bg-card cursor-pointer group-hover:rounded-lg transition-all duration-200"
                  onClick={() => navigate(`/watch/${video.id}`)}
                >
                  <img
                    src={
                      editingVideoId === video.id && editThumbnail
                        ? editThumbnail
                        : video.thumbnail
                    }
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/85 text-white text-xs font-medium px-1.5 py-0.5 rounded">
                    {video.duration}
                  </div>
                  {isOwner && (
                    <span
                      className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${video.privacy === "public" ? "bg-success/80 text-white" : "bg-secondary-600 text-white"}`}
                    >
                      {video.privacy}
                    </span>
                  )}
                </div>
                <div className="mt-3 px-1">
                  {editingVideoId === video.id ? (
                    <div className="space-y-2 animate-slide-up">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Video title"
                        className="w-full bg-elevated border border-base rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors text-primary-custom placeholder:text-secondary-custom"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        placeholder="Video description"
                        className="w-full bg-elevated border border-base rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition-colors resize-none text-primary-custom placeholder:text-secondary-custom"
                      />
                      <FilePicker
                        icon={ImageIcon}
                        name={editThumbnailName}
                        accept="image/*"
                        label="Change thumbnail"
                        onChange={(file, name) => {
                          setEditThumbnail(file);
                          setEditThumbnailName(name);
                        }}
                      />
                      <FilePicker
                        icon={Film}
                        name={editVideoName}
                        accept="video/*"
                        label="Change video file"
                        onChange={(file, name) => {
                          setEditVideo(file);
                          setEditVideoName(name);
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary-700 transition-colors"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button
                          onClick={() => setEditingVideoId(null)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-elevated text-primary-custom text-xs font-medium hover:bg-hover transition-colors"
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3
                        className="font-semibold text-sm leading-snug line-clamp-2 text-primary-custom cursor-pointer hover:text-primary transition-colors"
                        onClick={() => navigate(`/watch/${video.id}`)}
                      >
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-secondary-custom mt-1">
                        <span>{formatViews(video.views)} views</span>
                        <span>•</span>
                        <span>{video.uploadedText}</span>
                      </div>
                      {isOwner && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => togglePublish(video.id)}
                            className="px-2.5 py-1 rounded-full bg-elevated hover:bg-hover text-primary-custom text-xs font-medium transition-colors"
                          >
                            {video.privacy === "public"
                              ? "Make Private"
                              : "Publish"}
                          </button>
                          <button
                            onClick={() => startEdit(video)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-elevated hover:bg-hover text-primary-custom text-xs font-medium transition-colors"
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await deleteVideo(video.id);
                                setConfirmDeleteId(null);
                              } catch (error) {
                                console.error("Delete failed :", error);
                              }
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-elevated hover:bg-error/10 hover:text-error text-primary-custom text-xs font-medium transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {confirmDeleteId === video.id && (
                  <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    <div
                      className="w-full max-w-sm bg-card rounded-2xl shadow-2xl p-6 border border-base animate-scale-in"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3 className="text-lg font-bold text-primary-custom mb-2">
                        Delete this video?
                      </h3>
                      <p className="text-sm text-secondary-custom mb-4">
                        This action cannot be undone. The video will be
                        permanently removed.
                      </p>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-4 py-2 rounded-full text-sm font-medium bg-elevated hover:bg-hover text-primary-custom transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            onDeleteVideo?.(video.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-4 py-2 rounded-full text-sm font-semibold bg-error text-white hover:bg-error/80 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilePicker({
  icon: Icon,
  name,
  accept,
  label,
  onChange,
}: {
  icon: typeof ImageIcon;
  name: string | null;
  accept: string;
  label: string;
  onChange: (file: File, name: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-base hover:border-primary transition-colors cursor-pointer">
      <Icon className="w-3.5 h-3.5 text-secondary-custom" />
      <span className="text-xs text-secondary-custom">{name || label}</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file, file.name);
        }}
      />
    </label>
  );
}
// }

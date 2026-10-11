import { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  Film,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  Globe,
  Lock,
} from "lucide-react";
import type { Privacy } from "../types";
import { useVideos } from "@/contexts/VideoContext";

interface UploadModalProps {
  onClose: () => void;
  defaultPrivacy?: Privacy;
}

export default function UploadModal({
  onClose,
  defaultPrivacy = "public",
}: UploadModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [thumbnailName, setThumbnailName] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [privacy, setPrivacy] = useState<Privacy>(defaultPrivacy);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const { publishVideo } = useVideos();

  function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setFileName(file.name);
    setVideoPreviewUrl(URL.createObjectURL(file));
  }

  function handleThumbSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailName(file.name);
    setThumbnailFile(file);
  }

  function handleVideoDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingVideo(false);
    const file = e.dataTransfer.files?.[0];

    if (!file) return;
    setVideoFile(file);
    setFileName(file.name);
    setVideoPreviewUrl(URL.createObjectURL(file));
  }

  function handleThumbDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingThumb(false);

    const file = e.dataTransfer.files?.[0];

    if (!file) return;

    setThumbnailName(file.name);
    setThumbnailFile(file);
  }

  async function handlePublish() {
    if (!title.trim() || !videoFile) return;

    try {
      setIsPublishing(true);

      await publishVideo({
        title,
        description,
        privacy,
        thumbnail: thumbnailFile,
        video: videoFile,
      });

      setPublished(true);

      // onClose();
    } catch (error) {
      console.error("UPLOAD ERROR :", error);
    } finally {
      setIsPublishing(false);
    }
  }
  const canPublish =
    Boolean(title.trim()) &&
    Boolean(videoFile) &&
    !isPublishing &&
    !published &&
    !videoUploading;

  const privacyOptions: {
    value: Privacy;
    label: string;
    icon: typeof Globe;
  }[] = [
    { value: "public", label: "Public", icon: Globe },
    { value: "private", label: "Private", icon: Lock },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-card rounded-2xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto scrollbar-thin border border-base text-primary-custom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Film className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold">Upload Video</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {published ? (
          <div className="p-12 text-center animate-scale-in">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>

            <h3 className="text-lg font-bold mb-2">
              {privacy === "public"
                ? "Video Published!"
                : "Video Saved as Private!"}
            </h3>

            <p className="text-sm text-secondary-custom">
              {privacy === "public"
                ? "Your video is now live on VideoTube."
                : "Your video is private and visible only on your channel."}
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Video file upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Video File <span className="text-primary">*</span>
              </label>
              <div
                onClick={() => videoInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingVideo(true);
                }}
                onDragLeave={() => setIsDraggingVideo(false)}
                onDrop={handleVideoDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                  transition-all
                  ${isDraggingVideo ? "border-primary bg-primary/5 scale-[1.02]" : "border-base hover:border-secondary-custom"}
                  ${fileName && !videoUploading ? "bg-success/5 border-success/50" : ""}
                `}
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
                {videoUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm font-medium">
                      Uploading... {uploadProgress}%
                    </p>
                    <div className="w-full max-w-xs h-1.5 bg-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-75"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : fileName ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <p className="text-sm font-medium">{fileName}</p>
                    <p className="text-xs text-secondary-custom">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-elevated rounded-full flex items-center justify-center">
                      <UploadCloud className="w-5 h-5 text-secondary-custom" />
                    </div>
                    <p className="text-sm font-medium">
                      Drag & drop or click to browse
                    </p>
                    <p className="text-xs text-secondary-custom">
                      MP4, MOV, AVI up to 2GB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Thumbnail Image
              </label>
              <div
                onClick={() => thumbInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingThumb(true);
                }}
                onDragLeave={() => setIsDraggingThumb(false)}
                onDrop={handleThumbDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer
                  transition-all
                  ${isDraggingThumb ? "border-primary bg-primary/5 scale-[1.02]" : "border-base hover:border-secondary-custom"}
                  ${thumbnailName ? "bg-success/5 border-success/50" : ""}
                `}
              >
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbSelect}
                  className="hidden"
                />
                {thumbnailName ? (
                  <div className="flex items-center justify-center gap-2">
                    <ImageIcon className="w-5 h-5 text-success" />
                    <p className="text-sm font-medium">{thumbnailName}</p>
                    <span className="text-xs text-secondary-custom">
                      — Click to change
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <ImageIcon className="w-5 h-5 text-secondary-custom" />
                    <p className="text-sm text-secondary-custom">
                      Drag & drop or click to upload thumbnail
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Title <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a compelling video title..."
                maxLength={100}
                className="w-full bg-elevated border border-base rounded-lg px-4 py-3 text-sm outline-none focus:border-primary transition-colors text-primary-custom placeholder:text-secondary-custom"
              />
              <p className="text-xs text-secondary-custom mt-1 text-right">
                {title.length}/100
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers about your video..."
                rows={3}
                maxLength={5000}
                className="w-full bg-elevated border border-base rounded-lg px-4 py-3 text-sm outline-none focus:border-primary transition-colors resize-none text-primary-custom placeholder:text-secondary-custom"
              />
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Privacy
              </label>
              <div className="relative">
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as Privacy)}
                  className="w-full appearance-none bg-elevated border border-base rounded-lg px-4 py-3 text-sm outline-none focus:border-primary transition-colors cursor-pointer text-primary-custom"
                >
                  {privacyOptions.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      className="bg-elevated text-primary-custom"
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  {(() => {
                    const Icon =
                      privacyOptions.find((o) => o.value === privacy)?.icon ||
                      Globe;
                    return <Icon className="w-4 h-4 text-secondary-custom" />;
                  })()}
                </div>
              </div>
            </div>

            {/* Publish button */}
            <div className="flex items-center justify-between pt-2 border-t border-base">
              <p className="text-xs text-secondary-custom">
                {videoUploading
                  ? "Uploading video..."
                  : canPublish
                    ? "Ready to publish"
                    : "Add a title and video file to publish"}
              </p>
              <button
                onClick={handlePublish}
                disabled={!canPublish}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all
                  ${
                    canPublish
                      ? "bg-primary text-white hover:bg-primary-700"
                      : "bg-elevated text-secondary-custom cursor-not-allowed"
                  }
                `}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish Video"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

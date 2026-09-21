import { useState } from "react";
import {
	User as UserIcon,
	Lock,
	Image as ImageIcon,
	Globe,
	Loader2,
	Check,
	Upload,
	Mail,
} from "lucide-react";
import type { User, Privacy } from "@/types";
import {
	updateAccount,
	updateAvatar,
	updateCoverImage,
	getCurrentUser,
	changePassword,
} from "@/services/userApi";

interface SettingsPageProps {
	user: User;
	onDefaultPublishPrivacy: (privacy: Privacy) => void;
	defaultPublishPrivacy: Privacy;
}

export default function SettingsPage({
	user,
	onDefaultPublishPrivacy,
	defaultPublishPrivacy,
}: SettingsPageProps) {
	const [activeTab, setActiveTab] = useState<"profile" | "security" | "publishing">("profile");
	const [name, setName] = useState(user.name);
	const [username, setUsername] = useState(user.handle || "");
	const [email, setEmail] = useState(user.email || "");
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const [coverUrl, setCoverUrl] = useState<string | null>(null);
	const [avatarName, setAvatarName] = useState<string | null>(null);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [coverFile, setCoverFile] = useState<File | null>(null);
	const [coverName, setCoverName] = useState<string | null>(null);
	const [savingProfile, setSavingProfile] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [savingPassword, setSavingPassword] = useState(false);
	const [passwordError, setPasswordError] = useState("");

	function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) {
			setAvatarFile(file);
			setAvatarName(file.name);
			setAvatarUrl(URL.createObjectURL(file));
		}
	}

	function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) {
			setCoverFile(file);
			setCoverName(file.name);
			setCoverUrl(URL.createObjectURL(file));
		}
	}

	async function handleSaveProfile() {
		setSavingProfile(true);
		try {
			await updateAccount(name, username, email);
			if (avatarFile) await updateAvatar(avatarFile);
			if (coverFile) await updateCoverImage(coverFile);
			// Refreshing the page-level user is handled by the authenticated shell.
			await getCurrentUser();
			setAvatarFile(null);
			setCoverFile(null);
			setAvatarName(null);
			setCoverName(null);
		} catch (error) {
			console.error("UPDATE PROFILE ERROR:", error);
		} finally {
			setSavingProfile(false);
		}
	}

	async function handleChangePassword() {
		setPasswordError("");
		if (!currentPassword || !newPassword || !confirmPassword) {
			setPasswordError("All fields are required");
			return;
		}
		if (newPassword !== confirmPassword) {
			setPasswordError("New passwords do not match");
			return;
		}
		if (newPassword.length < 6) {
			setPasswordError("Password must be at least 6 characters");
			return;
		}
		setSavingPassword(true);
		try {
			await changePassword(currentPassword, newPassword);
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (error) {
			setPasswordError(error instanceof Error ? error.message : "Failed to change password");
		} finally {
			setSavingPassword(false);
		}
	}

	const tabs = [
		{ id: "profile" as const, label: "Profile", icon: UserIcon },
		{ id: "security" as const, label: "Security", icon: Lock },
		{ id: "publishing" as const, label: "Publishing", icon: Globe },
	];
	const privacyOptions: { value: Privacy; label: string; desc: string; icon: typeof Globe }[] = [
		{ value: "public", label: "Public", desc: "Anyone can find and watch this video", icon: Globe },
		{ value: "private", label: "Private", desc: "Only you can watch this video", icon: Lock },
	];
	const displayAvatar = avatarUrl || user.avatar;
	const displayCover = coverUrl || user.coverImage;

	return (
		<div className="animate-fade-in max-w-3xl mx-auto">
			<h1 className="text-2xl font-bold text-primary-custom mb-6">Settings</h1>
			<div className="flex gap-1 mb-6 border-b border-base">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-secondary-custom hover:text-primary-custom"}`}><Icon className="w-4 h-4" />{tab.label}</button>;
				})}
			</div>

			{activeTab === "profile" && (
				<div className="space-y-5">
					<div className="relative h-36 rounded-xl overflow-hidden bg-elevated">
						{displayCover ? <img src={displayCover} alt="Cover" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-primary/20 via-elevated to-base" />}
						<div className="absolute bottom-3 left-3">{displayAvatar ? <img src={displayAvatar} alt={user.name} className="w-16 h-16 rounded-full ring-4 ring-base object-cover" /> : <div className="w-16 h-16 rounded-full ring-4 ring-base bg-primary flex items-center justify-center text-white text-xl font-bold">{user.name?.charAt(0).toUpperCase()}</div>}</div>
					</div>
					<FilePicker label="Cover Image" icon={Upload} name={coverName} placeholder="Upload cover image (optional)" accept="image/*" onChange={handleCoverChange} />
					<FilePicker label="Avatar" icon={ImageIcon} name={avatarName} placeholder="Upload new avatar (optional)" accept="image/*" onChange={handleAvatarChange} />
					<p className="text-xs text-secondary-custom mt-1">If no avatar is uploaded, your initials will be used automatically.</p>
					<Field label="Display Name"><input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} /></Field>
					<Field label="Username"><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" className={inputClass} /></Field>
					<Field label="Email"><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-custom" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className={`${inputClass} pl-10`} /></div></Field>
					<button onClick={handleSaveProfile} disabled={savingProfile} className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50">{savingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Changes</>}</button>
				</div>
			)}

			{activeTab === "security" && <div className="space-y-5"><PasswordField label="Current Password" value={currentPassword} onChange={setCurrentPassword} placeholder="Enter current password" /><PasswordField label="New Password" value={newPassword} onChange={setNewPassword} placeholder="Enter new password" /><PasswordField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm new password" />{passwordError && <p className="text-sm text-error animate-slide-up">{passwordError}</p>}<button onClick={handleChangePassword} disabled={savingPassword} className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50">{savingPassword ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><Lock className="w-4 h-4" /> Change Password</>}</button></div>}

			{activeTab === "publishing" && <div className="space-y-5"><div><h3 className="text-sm font-semibold text-primary-custom mb-1">Default Upload Privacy</h3><p className="text-xs text-secondary-custom mb-4">When you upload a new video, it will default to this privacy setting.</p><div className="space-y-2">{privacyOptions.map((option) => { const Icon = option.icon; return <button key={option.value} onClick={() => onDefaultPublishPrivacy(option.value)} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${defaultPublishPrivacy === option.value ? "border-primary bg-primary/5 text-primary-custom" : "border-base bg-elevated text-primary-custom hover:border-secondary-custom"}`}><div className="flex items-center gap-3"><Icon className="w-4 h-4" /><div className="text-left"><p className="text-sm font-medium">{option.label}</p><p className="text-xs text-secondary-custom">{option.desc}</p></div></div>{defaultPublishPrivacy === option.value && <Check className="w-4 h-4 text-primary" />}</button>; })}</div></div></div>}
		</div>
	);
}

const inputClass = "w-full bg-elevated border border-base rounded-lg px-4 py-3 text-sm outline-none focus:border-primary transition-colors text-primary-custom placeholder:text-secondary-custom";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return <div><label className="block text-sm font-semibold mb-2 text-primary-custom">{label}</label>{children}</div>;
}

function FilePicker({ label, icon: Icon, name, placeholder, accept, onChange }: { label: string; icon: typeof Upload; name: string | null; placeholder: string; accept: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) {
	return <div><label className="block text-sm font-semibold mb-2 text-primary-custom">{label}</label><label className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-base hover:border-primary transition-colors cursor-pointer"><Icon className="w-4 h-4 text-secondary-custom" /><span className="text-sm text-secondary-custom">{name || placeholder}</span><input type="file" accept={accept} className="hidden" onChange={onChange} /></label></div>;
}

function PasswordField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
	return <Field label={label}><input type="password" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} /></Field>;
}
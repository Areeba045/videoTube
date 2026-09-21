import { apiFetch } from "../utils/api";
import type { User } from "@/types";

interface BackendUser {
  _id?: string;
  fullName?: string;
  username?: string;
  email?: string;
  avatar?: string;
  coverImage?: string;
  subscribers?: number;
  totalVideos?: number;
}

interface SubscriptionRecord extends BackendUser {
  channel?: BackendUser;
  creator?: BackendUser;
}

export const normalizeUser = (user: BackendUser): User => {
  return {
    id: user._id || "",
    name: user.fullName || user.username || "Unknown user",
    handle: user.username || "",
    email: user.email,
    avatar: user.avatar || "",
    coverImage: user.coverImage,
    subscribers: user.subscribers || 0,
    totalVideos: user.totalVideos || 0,
    isSubscribed: false,
  };
};
export const registerUser = async (formData: FormData) => {
  return apiFetch("/users/register", {
    method: "POST",
    body: formData,
  });
};

export const loginUser = async (email: string, password: string) => {
  return apiFetch("/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

export const refreshAccessToken = async () => {
  return apiFetch("/users/refresh-token" , {
    method : "POST",
  })
}
export const getCurrentUser = async () => {
  const response = await apiFetch<{ data: BackendUser }>("/users/current-user", {
    method: "GET",
  });

  return normalizeUser(response.data);
};


export const logoutUser = async () => {
  return apiFetch("/users/logout", {
    method: "POST",
  });
};

export const updateAccount = async (
  fullName: string,
  username: string,
  email: string,
) => {
  return apiFetch("/users/update-account", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName,
      username,
      email,
    }),
  });
};

export const changePassword = async (
  oldPassword: string,
  newPassword: string,
) => {
  console.log("ChangE Password API Called")
  const response = await  apiFetch("/users/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      oldPassword,
      newPassword,
    }),
  });

  console.log("CHANGE PASSWORD RESPONSE: " , response);

  return response;
};

export const updateAvatar = async (avatar: File) => {
  const formData = new FormData();
  formData.append("avatar", avatar);

  return apiFetch("/users/avatar", {
    method: "PATCH",
    body: formData,
  });
};

export const updateCoverImage = async (coverImage: File) => {
  const formData = new FormData();

  formData.append("coverImage", coverImage);

  return apiFetch("/users/cover-Image", {
    method: "PATCH",
    body: formData,
  });
};

export const getChannelProfile = async (channelId: string) => {
  return apiFetch<{ data: BackendUser }>(`/users/c/${channelId}`);
};

export const getWatchHistory = async () => {
  return apiFetch<{ data: Record<string, unknown>[] }>("/users/history");
};

export const getSubscribedChannels = async () => {
  const response = await apiFetch<{
    data: SubscriptionRecord[] | { channels?: SubscriptionRecord[]; subscriptions?: SubscriptionRecord[] };
  }>("/subscriptions");
  const subscriptions = Array.isArray(response.data)
    ? response.data
    : response.data?.channels || response.data?.subscriptions || [];

  return subscriptions.map((subscription: SubscriptionRecord) =>
    normalizeUser(subscription.channel || subscription.creator || subscription),
  );
};

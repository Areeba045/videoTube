import { apiFetch } from "@/utils/api"

export const addtoWatchHistory = async (videoId : string) => {
    return apiFetch(`/users/history/${videoId}` , {
        method : "POST",
    })
}

export const removeFromWatchHistory = async (historyId: string) => {
  return apiFetch(`/users/history/entry/${historyId}`, {
    method: "DELETE",
  });
};


export const clearWatchHistory = async () => {
  return apiFetch("/users/history", {
    method: "DELETE",
  });
};
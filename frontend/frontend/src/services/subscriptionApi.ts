
import { apiFetch } from "@/utils/api";

export async function getSubscribedChannels() {
  return apiFetch("/subscriptions/subscribed");
}

export async function getChannelSubscribers(channelId: string) {
  return apiFetch(`/subscriptions/c/${channelId}`);
}

export async function toggleSubscription(channelId: string) {
  return apiFetch(`/subscriptions/c/${channelId}`, {
    method: "POST",
  });
}



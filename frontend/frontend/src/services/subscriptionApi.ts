// import { apiFetch } from "@/utils/api";



// export async function getSubscribedChannels(){
//     return apiFetch("/subscription/subscribed");
// }


// export async function getChannelSuscribers(channelId : string){
//     return apiFetch(`/subscription/c/${channelId}`)
// }


// export async function toggelSubscrition(channelId : string){
//     return apiFetch(`/subscription/c/${channelId}` , {
//         method : "POST"
//     })
// }


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



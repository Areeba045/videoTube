import {
  toggleSubscription as toggleSubscriptionApi,
  getChannelSubscribers,
  getSubscribedChannels,
} from "@/services/subscriptionApi";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { User } from "@/types";

interface SubscriptionContextType {
  subscribedChannels: User[];
  loading: boolean;
  error: string | null;

  fetchSubscribedChannels: () => Promise<void>;

  toggleSubscription: (channelId: string) => Promise<boolean>;

  isSubscribed: (channelID: string) => boolean;
  clearSubscriptions: () => void;
  subscriberCounts: Record<string, number>;
  fetchSubscriberCount: (channelId: string) => Promise<number>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined,
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscribedChannels, setSubscribedChannels] = useState<User[]>([]);
  const [subscriberCounts, setSubscriberCounts] = useState<
  Record<string, number>
>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // //get all channels that current user subscribed to
  // const fetchSubscribedChannels = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);

  //     const response = await getSubscribedChannels();

  //     const channels = (response.data || []).map((item: any) => {
  //       const channel = item.channel;

  //       return {
  //         id: channel._id,
  //         name: channel.fullName || channel.username || "unKnown Channel",
  //         handle: channel.username || "",
  //         avatar: channel.avatar || "",
  //         subscribers: 0,
  //         isSubscribed: true,
  //       };
  //     });

  //     setSubscribedChannels(channels);
  //   } catch (error: any) {
  //     console.error("Failed to fetch subscriptions: ", error);

  //     setError(error.message || "Failed to fetch subscriptions");
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);


  const fetchSubscribedChannels = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await getSubscribedChannels();

    const channels = await Promise.all(
      (response.data || []).map(async (item: any) => {
        const channel = item.channel;

        const countResponse = await getChannelSubscribers(channel._id);

        const subscriberCount =
          countResponse.data?.subscriberCount ?? 0;

        return {
          id: channel._id,
          name: channel.fullName || channel.username || "Unknown Channel",
          handle: channel.username || "",
          avatar: channel.avatar || "",
          subscribers: subscriberCount,
          isSubscribed: true,
        };
      }),
    );

    setSubscribedChannels(channels);

    // Also save counts in context
    const counts: Record<string, number> = {};

    channels.forEach((channel) => {
      counts[channel.id] = channel.subscribers;
    });

    setSubscriberCounts((previous) => ({
      ...previous,
      ...counts,
    }));
  } catch (error: any) {
    console.error("Failed to fetch subscriptions:", error);
    setError(error.message || "Failed to fetch subscriptions");
  } finally {
    setLoading(false);
  }
}, []);

  const fetchSubscriberCount = useCallback(async (channelId: string) => {
  try {
    const response = await getChannelSubscribers(channelId);

    const count = response.data?.subscriberCount ?? 0;

    setSubscriberCounts((previous) => ({
      ...previous,
      [channelId]: count,
    }));

    return count;
  } catch (error) {
    console.error("Failed to fetch subscriber count:", error);
    return 0;
  }
}, []);


  // Subscrib /unSubscribe
  const toggleSubscription = useCallback(
    async (channelId: string) => {
      const response = await toggleSubscriptionApi(channelId);

      const isNowSubscibed = response.data?.isSubscribed === true;

      if (isNowSubscibed) {
        // We need channel information here .
        //ChannelPage can refresh the subscription list
        await fetchSubscribedChannels();
      } else {
        //Remove channel from subscribed list
        setSubscribedChannels((previous) =>
          previous.filter((channel) => channel.id !== channelId),
        );
      }

       // Get latest count from backend
    await fetchSubscriberCount(channelId); 
      return isNowSubscibed;
    },
    [fetchSubscribedChannels , fetchSubscriberCount ],
  );

  // Cheeck Weather a channel is subscribed
  const isSubscribed = useCallback(
    (channelId: string) => {
      return subscribedChannels.some((channel) => channel.id === channelId);
    },
    [subscribedChannels],
  );

  const clearSubscriptions = useCallback(() => {
    setSubscribedChannels([]);
    setSubscriberCounts({})
    setError(null);
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        subscribedChannels,
        subscriberCounts ,
        loading,
        error,
        fetchSubscribedChannels,
        fetchSubscriberCount , 
        toggleSubscription,
        isSubscribed,
        clearSubscriptions,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error(
      "useSubscriptions must be used inside SubscriptionProvider",
    );
  }

  return context;
}

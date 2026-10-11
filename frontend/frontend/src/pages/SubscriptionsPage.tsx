import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Rss } from "lucide-react";
import { formatSubscribers } from "@/utils/format";
import { useSubscriptions } from '@/contexts/subscriptionContext'
import type { User} from '@/types';

interface SubscriptionPageProps {
	currentUser : User | null;
	
}
export default function SubscriptionsPage(
	{ currentUser} : SubscriptionPageProps
) {
	const navigate = useNavigate();
	const { subscribedChannels , loading , error , fetchSubscribedChannels } = useSubscriptions()
	// const [subscribedChannels, setSubscribedChannels] = useState<User[]>([]);
	// const [loading, setLoading] = useState(true);
	// const [error, setError] = useState("");


	useEffect(() => {
		if(currentUser){
			fetchSubscribedChannels()
		}
		
	} ,[currentUser])
	// useEffect(() => {
	// 	let cancelled = false;

	// 	const loadSubscriptions = async () => {
	// 		try {
	// 			setLoading(true);
	// 			setError("");
	// 			const channels = await getSubscribedChannels();
	// 			if (!cancelled) setSubscribedChannels(channels);
	// 		} catch (requestError) {
	// 			if (!cancelled) {
	// 				setError(
	// 					requestError instanceof Error
	// 						? requestError.message
	// 						: "Failed to load subscriptions",
	// 				);
	// 			}
	// 		} finally {
	// 			if (!cancelled) setLoading(false);
	// 		}
	// 	};

	// 	loadSubscriptions();
	// 	return () => {
	// 		cancelled = true;
	// 	};
	// }, []);


// 	if (!currentUser) {
//   return (
//     <div className="py-24 text-center text-sm text-secondary-custom">
//       Please login to view your subscriptions.
//     </div>
//   );
// } 
	if (loading) {
		return <div className="py-24 text-center text-sm text-secondary-custom">Loading subscriptions...</div>;
	}

	if (error) {
		return <div className="py-24 text-center text-sm text-error">{error}</div>;
	}

	if (subscribedChannels.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
				<div className="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mb-4">
					<Rss className="w-8 h-8 text-secondary-custom" />
				</div>
				<h3 className="text-lg font-semibold mb-1 text-primary-custom">No subscriptions yet</h3>
				<p className="text-sm text-secondary-custom max-w-sm">
					Subscribe to channels to see them here. Click a channel to view all their videos.
				</p>
			</div>
		);
	}

	return (
		<div className="animate-fade-in">
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
				{subscribedChannels.map((channel) => (
					<button
						key={channel.id}
						onClick={() => navigate(`/channel/${channel.id}`)}
						className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-elevated transition-all duration-200 group"
					>
						<img
							src={channel.avatar}
							alt={channel.name}
							className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-2 ring-base group-hover:ring-primary transition-all duration-200"
						/>
						<div className="text-center">
							<h3 className="font-semibold text-sm text-primary-custom group-hover:text-primary transition-colors">
								{channel.name}
							</h3>
							<p className="text-xs text-secondary-custom mt-0.5">
								{formatSubscribers(channel.subscribers)}
							</p>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
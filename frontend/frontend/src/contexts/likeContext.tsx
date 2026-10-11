// import { createContext , useContext , useState , ReactNode } from "react";

// import { toggleVideoLike , getLikeVideos  , type ReactionType  } from "@/services/likeApi";

// interface LikeContextType {
//     likedVideos : any[] ;
//     loading :  boolean ;

//     toggleLike : (videoId : string , type : ReactionType) => Promise<{
//         reaction : ReactionType | null ;
//         likeCount : number ;
//         dislikeCount : number ;
//     }>

//     loadLikedVideos : () => Promise<void>;
// }



// const LikeContext = createContext<LikeContextType | undefined >(undefined)

// export const  LikeProvider = ({ children } : { children : ReactNode}) => {

//     const [likedVideos , setLikedVideos] = useState<any[]>([]);
//     const [ loading , setLoading ] = useState(false);

//     const toggleLike = async (
//         videoId : string ,
//         type :  ReactionType
//     ) => {
//         const response = await toggleVideoLike(videoId , type);

//         return response.data ;

//     }



//     const loadLikedVideos = async () => {
//         try {
//             setLoading(true);

//             const response = await getLikeVideos();

//             setLikedVideos(response.data || []);

//         } catch (error) {
//             console.error("Failed to load liked videos :" , error);
//             setLikedVideos([]);
//         }finally{
//             setLoading(false);
//         }
//     }





//     return (
//         <LikeContext.Provider
//         value={{
//             likedVideos, 
//             loadLikedVideos ,
//             loading ,
//             toggleLike ,
//         }}>
//             {children}
//         </LikeContext.Provider>
//     )
// }

// export const useLike = () => {
//     const context = useContext(LikeContext);

//     if(!context){
//         throw new Error(
//             "useLike must be used inside LikeProvider"
//         );
//     }

//     return context ;
    
// }



import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import {
  toggleVideoLike,
  getLikeVideos,
  type ReactionType,
  type ToggleLikeResponse ,
} from "@/services/likeApi";

interface LikeContextType {
  likedVideos: any[];
  loading: boolean;

  reactions: Record<string, ReactionType | null>;

  toggleLike: (
    videoId: string,
    type: ReactionType
  ) => Promise<ToggleLikeResponse>;

  syncReaction: (
    videoId: string,
    reaction: ReactionType | null
  ) => void;

  loadLikedVideos: () => Promise<void>;
}

const LikeContext = createContext<LikeContextType | undefined>(
  undefined
);

export const LikeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [likedVideos, setLikedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [reactions, setReactions] = useState<
    Record<string, ReactionType | null>
  >({});

//   const syncReaction = useCallback(
//     (videoId: string, reaction: ReactionType | null) => {
//       setReactions((previous) => ({
//         ...previous,
//         [videoId]: reaction,
//       }));
//     },
//     []
//   );

const syncReaction = useCallback(
  (videoId: string, reaction: ReactionType | null) => {
    setReactions((previous) => ({
      ...previous,
      [videoId]: reaction,
    }));
  },
  []
);

  const toggleLike = async (
  videoId: string,
  type: ReactionType
): Promise<ToggleLikeResponse> => {
  const response = await toggleVideoLike(videoId, type);

  const  { reaction }= response.data;

  // Update reaction state immediately after backend success
  syncReaction(videoId, reaction);

  // Keep likedVideos in sync too
//   setLikedVideos((previous) => {
//     if (newReaction === "like") {
//       return previous;
//     }

//     return previous.filter(
//       (item: any) => item.video?._id !== videoId
//     );
//   });


  // Keep liked videos synchronized
  if (reaction === "like") {
    await loadLikedVideos();
  } else {
    setLikedVideos((previous) =>
      previous.filter(
        (item: any) => item.video?._id !== videoId
      )
    );
  }
  return response.data;
};

//   const toggleLike = async (
//     videoId: string,
//     type: ReactionType
//   ): Promise<ReactionType | null> => {
//     const response = await toggleVideoLike(videoId, type);

//     const newReaction = response.data.reaction;

//     syncReaction(videoId, newReaction);

//     return newReaction;
//   };

//   const loadLikedVideos = useCallback(async () => {
//     try {
//       setLoading(true);

//       const response = await getLikeVideos();

//       setLikedVideos(response.data || []);
//       console.log("LIKED VIDEOS RESPONSE:", response.data);
//     } catch (error) {
//       console.error("Failed to load liked videos:", error);
//       setLikedVideos([]);
//     } finally {
//       setLoading(false);
//     }
//   } ,[]);


const loadLikedVideos = useCallback(async () => {
  try {
    setLoading(true);

    const response = await getLikeVideos();

    const likedData = response.data || [];

    setLikedVideos(likedData);

    setReactions((previous) => {
      const next = { ...previous };

      likedData.forEach((item: any) => {
        if (item.video?._id) {
          next[item.video._id] = item.reactionType;
        }
      });

      return next;
    });

    console.log("LIKED VIDEOS RESPONSE:", likedData);
  } catch (error) {
    console.error("Failed to load liked videos:", error);
    setLikedVideos([]);
  } finally {
    setLoading(false);
  }
}, []);


  return (
    <LikeContext.Provider
      value={{
        likedVideos,
        loading,
        reactions,
        toggleLike,
        syncReaction,
        loadLikedVideos,
      }}
    >
      {children}
    </LikeContext.Provider>
  );
};

export const useLike = () => {
  const context = useContext(LikeContext);

  if (!context) {
    throw new Error("useLike must be used inside LikeProvider");
  }

  return context;
};
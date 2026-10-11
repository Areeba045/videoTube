export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  coverImage?: string;
  subscribers: number;
  isSubscribed: boolean;
  subscribedTo?: number;
  totalVideos?: number;
  email?: string;
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl?: string;
  duration: string;
  views: number;
  uploadedAt: string;
  uploadedText: string;
  channelId: string;
  category: string;
  description: string;
  likes: number;
  dislikes: number;
  tags: string[];
  watchedAt? : string ;
  privacy: 'public' | 'private' ;
  owner? : {
    _id : string ;
    username? : string ;
    fullName : string ;
    avatar? : string ;
    
  }
  historyId : string ;
  isSubscribed?: boolean;
}

// export interface Comment {
//   id: string;
//   videoId: string;
//   userId: string;
//   text: string;
//   likes: number;
//   createdAt: string;
//   replies: Comment[];
// }

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  text: string;
  likes: number;
  dislikes: number ;
  userReaction : "like" | "dislike" | null;
  createdAt: string;
  replies: Comment[];

  user?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
}

export interface Playlist {
  id: string;
  name: string;
  description: string ;
  videoIds: string[];
  icon: string;
}



// export interface Playlist {
//     _id : string ;
//     name: string ;
//     description : string ;
//     owner : string | {
//         _id : string ;
//         fullName : string ;
//         username : string ;
//         avatar? : string ;
//     };
//     videos : any[];
//     createdAt? : string ;
//     updatedAt? : string ;

// }

export type ViewName = 'home' | 'subscriptions' | 'library' | 'liked' | 'history' | 'playlist' | 'channel' | 'settings';

export type Privacy = 'public' | 'private' | 'unlisted';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatar: string;
}

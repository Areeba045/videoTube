import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import {
  getVideoComments,
  addComment as addCommentApi,
  addCommentReply,
  updateComment as updateCommentApi,
  deleteComment as deleteCommentApi,
  type BackendComment,
} from "@/services/commentApi";

import type { Comment, User } from "@/types";

interface CommentContextType {
  comments: Comment[];
  loading: boolean;

  loadComments: (videoId: string) => Promise<void>;

  addComment: (
    videoId: string,
    content: string,
    currentUser: User,
  ) => Promise<void>;

  updateComment: (commentId: string, newContent: string) => Promise<void>;

  deleteComment: (commentId: string) => Promise<void>;

  addReply: (
    videoId: string,
    commentId: string,
    content: string,
    currentUser: User,
  ) => Promise<void>;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

function normalizeComment(comment: BackendComment): Comment {
  const owner = comment.owner;

  const normalizedReplies = (comment.replies ?? []).map((reply) =>
    normalizeComment(reply),
  );

  return {
    id: comment._id,
    videoId: comment.video,
    userId: owner?._id || "",
    text: comment.content,
    likes: comment.likesCount ?? 0,
    dislikes: comment.dislikeCount ?? 0,
    userReaction: comment.userReaction ?? null,
    createdAt: comment.createdAt,
    replies: normalizedReplies,
    user: owner
      ? {
          id: owner._id,
          name:
            owner.fullname ||
            owner.fullName ||
            owner.username ||
            "Unknown User",
          username: owner.username || "",
          avatar: owner.avatar || "/default-avatar.png",
        }
      : undefined,
  };
}

function addReplyToTree(
  comments: Comment[],
  parentId: string,
  newReply: Comment,
): Comment[] {
  return comments.map((comment) => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies ?? []), newReply],
      };
    }

    return {
      ...comment,
      replies: addReplyToTree(comment.replies ?? [], parentId, newReply),
    };
  });
}

function removeCommentFromTree(
  comments: Comment[],
  commentId: string,
): Comment[] {
  return comments
    .filter((comment) => comment.id !== commentId)
    .map((comment) => ({
      ...comment,
      replies: removeCommentFromTree(comment.replies ?? [], commentId),
    }));
}

export function CommentProvider({ children }: { children: ReactNode }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadComments = useCallback(async (videoId: string) => {
    try {
      setLoading(true);

      const response = await getVideoComments(videoId);

      const backendComments = response.data || [];

      console.log("RAW COMMENTS AFTER REFRESH:", backendComments);
      console.log("CURRENT USER ID:" /* don't add this here yet */);

      const normalizedComments = backendComments.map(normalizeComment);

      setComments(normalizedComments);

      console.log("COMMENTS FROM BACKEND:", normalizedComments);
    } catch (error) {
      console.error("Failed to load comments:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = useCallback(
    async (videoId: string, content: string, currentUser: User) => {
      const response = await addCommentApi(videoId, content);

      const backendComment = response.data;

      const newComment: Comment = {
        ...normalizeComment(backendComment),

        // Backend addComment currently returns only the owner ID,
        // so use current logged-in user for immediate UI.
        userId: currentUser.id,

        user: {
          id: currentUser.id,
          name: currentUser.name,
          username: currentUser.handle || "",
          avatar: currentUser.avatar || "/default-avatar.png",
        },
      };

      setComments((previous) => [newComment, ...previous]);
    },
    [],
  );

  const addReply = useCallback(
    async (
      videoId: string,
      commentId: string,
      content: string,
      currentUser: User,
    ) => {
      const response = await addCommentReply(videoId, commentId, content);

      const backendReply = response.data;

      const newReply: Comment = {
        ...normalizeComment(backendReply),
        videoId,
        userId: currentUser.id,
        user: {
          id: currentUser.id,
          name: currentUser.name,
          username: currentUser.handle || "",
          avatar: currentUser.avatar || "/default-avatar.png",
        },
        replies: [],
      };

      setComments((previous) => addReplyToTree(previous, commentId, newReply));
    },
    [],
  );

  // const updateComment = useCallback(
  //   async (commentId: string, newContent: string) => {
  //     const response = await updateCommentApi(commentId, newContent);

  //     const updatedComment = normalizeComment(response.data);

  //     setComments((previous) =>
  //       previous.map((comment) =>
  //         comment.id === commentId
  //           ? {
  //               ...comment,
  //               text: updatedComment.text,
  //               createdAt: updatedComment.createdAt,
  //             }
  //           : comment,
  //       ),
  //     );
  //   },
  //   [],
  // );



const updateComment = useCallback(
  async (commentId: string, newContent: string) => {
    const response = await updateCommentApi(commentId, newContent);
    const updatedComment = normalizeComment(response.data);

    // Update the comment at any nesting level
    const updateNestedComment = (comments: Comment[]): Comment[] => {
      return comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            text: updatedComment.text,
            createdAt: updatedComment.createdAt,
          };
        }

        if (comment.replies?.length) {
          return {
            ...comment,
            replies: updateNestedComment(comment.replies),
          };
        }

        return comment;
      });
    };

    setComments((previous) => updateNestedComment(previous));
  },
  [],
);

  const deleteComment = useCallback(async (commentId: string) => {
    await deleteCommentApi(commentId);

    // setComments((previous) =>
    //   previous.filter(
    //     (comment) => comment.id !== commentId,
    //   ),
    // );
    setComments((previous) => removeCommentFromTree(previous, commentId));
  }, []);

  return (
    <CommentContext.Provider
      value={{
        comments,
        loading,
        loadComments,
        addComment,
        addReply,
        updateComment,
        deleteComment,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
}

export function useComments() {
  const context = useContext(CommentContext);

  if (!context) {
    throw new Error("useComments must be used inside CommentProvider");
  }

  return context;
}

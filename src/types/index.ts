export interface User {
  _id: string;
  name: string;
  username?: string;
  email?: string;
  photo?: string;
  cover?: string;
  gender?: string;
  dateOfBirth?: string;
  followersCount?: number;
  followingCount?: number;
  bookmarksCount?: number;
  postsCount?: number;
  createdAt?: string;
}

export interface Post {
  _id: string;
  body?: string;
  image?: string;
  privacy?: string;
  user: User;
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  topComment?: Comment;
}
export interface SuggestedUser extends User {
  isFollowing?: boolean;
}
export interface AppNotification {
  _id: string;
  type?: string; // like | comment | share | follow
  message?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
  sender?: User;
  actor?: User;
  user?: User;
}

export interface Comment {
  _id: string;
  content?: string;
  image?: string;
  commentCreator?: User;
  user?: User;
  createdAt: string;
  likesCount?: number;
  isLiked?: boolean;
  repliesCount?: number;
}
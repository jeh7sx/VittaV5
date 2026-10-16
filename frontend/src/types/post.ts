export interface Post {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string | null;
  text: string;
  imageUrl?: string | null;
  tag?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}
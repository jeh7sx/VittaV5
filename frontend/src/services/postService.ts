import { Post } from "../types/post";

const API_URL = "http://localhost:3001";

export const getPosts = async (limit = 10, startAfter?: string): Promise<Post[]> => {
  const url = `${API_URL}/posts?limit=${limit}${startAfter ? `&startAfter=${startAfter}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro ao carregar publicações.");
  return res.json();
};

export const createPost = async (data: {
  userId: string;
  userName: string;
  userPhoto?: string | null;
  text: string;
  imageUrl?: string | null;
  tag?: string;
}): Promise<Post> => {
  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao criar post.");
  return res.json();
};

export const toggleLikePost = async (postId: string, userId: string): Promise<{ liked: boolean }> => {
  const res = await fetch(`${API_URL}/posts/${postId}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Erro ao curtir post.");
  return res.json();
};
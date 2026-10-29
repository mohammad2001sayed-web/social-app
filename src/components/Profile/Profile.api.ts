import axios from "axios";
import type { AllPostRisponse } from "../../pages/Post/Post.interface";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const authHeaders = () => ({ token: localStorage.getItem("tkn") });

// بوستات اليوزر
export async function getUserPosts(userId: string) {
  const res = await axios.get<AllPostRisponse>(
    `${BASE_URL}/users/${userId}/posts`,
    { headers: authHeaders() },
  );
  return res.data.data.posts;
}

// البوستات المحفوظة (Bookmarks)
export async function getBookmarks() {
  const res = await axios.get(`${BASE_URL}/users/bookmarks`, {
    headers: authHeaders(),
  });
  return (res.data?.data?.bookmarks ?? res.data?.data?.posts ?? []) as any[];
}

// Followers / Following: بنقراهم من بروفايل اليوزر
// (لو الـ API عندك بيرجّعهم بإسم تاني، شوفي console.log في الـ Profile)
export async function getFollowList(
  userId: string,
  type: "followers" | "following",
) {
  const res = await axios.get(`${BASE_URL}/users/${userId}/profile`, {
    headers: authHeaders(),
  });
  const data = res.data?.data;
  return (data?.user?.[type] ?? data?.[type] ?? []) as any[];
}
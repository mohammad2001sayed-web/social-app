import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { token: localStorage.getItem("tkn") } });

export async function getUserPosts(userId: string) {
  const res = await axios.get(`${baseUrl}/users/${userId}/posts`, auth());
  // المسار الصحيح للبوستات: data ثم posts
  return res.data?.data?.posts ?? [];
}

// بيانات الحساب: name, username, photo, cover, gender, email, dateOfBirth, createdAt, isFollowing ...
export async function getUserProfile(userId: string) {
  const res = await axios.get(`${baseUrl}/users/${userId}/profile`, auth());
  return res.data?.data?.user ?? res.data?.data;
}

export async function getUserFollowList(
  userId: string,
  type: "followers" | "following"
) {
  const res = await axios.get(`${baseUrl}/users/${userId}/${type}`, auth());
  return res.data?.data?.[type] ?? res.data?.data ?? [];
}

export async function toggleFollow(userId: string) {
  const res = await axios.put(`${baseUrl}/users/${userId}/follow`, {}, auth());
  return res.data;
}
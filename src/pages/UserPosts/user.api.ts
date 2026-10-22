import axios from "axios";

export async function getUserPosts(userId: string) {
  const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("tkn");

  const res = await axios.get(`${baseUrl}/users/${userId}/posts`, {
    headers: {
      token: token,
    },
  });

  // المسار الصحيح للبوستات: data ثم posts
  return res.data?.data?.posts ?? [];
}
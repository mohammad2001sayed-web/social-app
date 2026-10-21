import axios from "axios";
import type { Post } from "./Post.interface";

export async function HandleAllPost(): Promise<Post[]> {
  const token = localStorage.getItem("tkn");

  try {
    const res = await axios.get(
      `https://route-posts.routemisr.com/posts?limit=50`,
      {
        headers: {
          token: token || "",
        },
      }
    );

    console.log("Full API Response:", res.data);

    return res.data.data.posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}





export async function toggleLikePost(postId: string) {
  const token = localStorage.getItem("tkn");
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // الـ API هنا مشهور إنه بيستخدم PUT لللايك/الأنلايك (بيعمل toggle تلقائي)
  return await axios.put(
    `${baseUrl}/posts/${postId}/like`,
    {},
    {
      headers: {
        token: token || "",
      },
    }
  );
}
import axios from "axios";
import type { Post } from "./Post.interface";

export async function HandleAllPost(): Promise<Post[]> {
  const token = localStorage.getItem("tkn");

  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/posts?limit=50`,
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


// دالة مشاركة البوست
export const getBaseUrl = () =>
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BASE_URL 

const getToken = () => localStorage.getItem("tkn") || "";

export async function sharePostApi({ postId, body }: { postId: string; body: { body: string } }) {
  return await axios.post(
    `${getBaseUrl()}/posts/${postId}/share`,
    body,
    {
      headers: { token: getToken() },
    }
  );
}



// دالة حفظ / إلغاء حفظ البوست (Bookmark)
export async function toggleBookmarkPost(postId: string) {
  return await axios.put(
    `${getBaseUrl()}/posts/${postId}/bookmark`,
    {},
    {
      headers: { token: getToken() },
    }
  );
}


// دالة دعم / إلغاء دعم البوست
export async function toggleFollowUser(userId: string) {
  return await axios.put(
    `${getBaseUrl()}/users/${userId}/follow`,
    {},
    { headers: { token: getToken() } },
  );
}





const authHeaders = () => ({
  headers: { token: localStorage.getItem("tkn") || "" },
});

// المستخدمين المقترحين
export async function getSuggestedUsersApi(limit = 5) {
  const res = await axios.get(
    `${getBaseUrl()}/users/suggestions?limit=${limit}`,
    authHeaders(),
  );
  console.log("suggestions:", res.data); // مؤقتًا، امسحيه بعد ما يشتغل
  const d = res.data?.data ?? res.data;
  const list = d?.suggestions ?? d?.users ?? (Array.isArray(d) ? d : []);
  return Array.isArray(list) ? list : [];
}

// متابعة مستخدم
export async function followUserApi(userId: string) {
  return await axios.put(
    `${getBaseUrl()}/users/${userId}/follow`,
    {},
    authHeaders(),
  );
}


export async function getSuggestedUsersPageApi({
  page,
  limit = 5,
}: {
  page: number;
  limit?: number;
}) {
  const res = await axios.get(
    `${getBaseUrl()}/users/suggestions?page=${page}&limit=${limit}`,
    authHeaders(),
  );

  const root = res.data;
  const d = root?.data ?? root;
  const list = d?.suggestions ?? d?.users ?? (Array.isArray(d) ? d : []);
  const users = Array.isArray(list) ? list : [];

  const pg = root?.meta?.pagination ?? d?.pagination;
  const totalPages: number | undefined =
    pg?.numberOfPages ?? pg?.totalPages ?? undefined;

  return {
    users,
    totalPages,
    hasNext: totalPages ? page < totalPages : users.length === limit,
  };
}
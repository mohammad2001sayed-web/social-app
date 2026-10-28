import axios from "axios";

const getBaseUrl = () =>
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BASE_URL 

const getToken = () => localStorage.getItem("tkn") || "";

// =========================
// 1. Delete Comment
// =========================
export async function deleteCommentApi({ postId, commentId }: { postId: string; commentId: string }) {
  return await axios.delete(
    `${getBaseUrl()}/posts/${postId}/comments/${commentId}`,
    {
      headers: {
        token: getToken(),
      },
    }
  );
}

// =========================
// 2. Update Comment
// =========================
export async function updateCommentApi({
  postId,
  commentId,
  formData,
}: {
  postId: string;
  commentId: string;
  formData: FormData;
}) {
  return await axios.put(
    `${getBaseUrl()}/posts/${postId}/comments/${commentId}`,
    formData,
    {
      headers: {
        token: getToken(),
      },
    }
  );
}

// =========================
// 3. Like / Unlike Comment (بناءً على الـ Endpoint اللي بعتها)
// =========================
export async function toggleCommentLikeApi({ postId, commentId }: { postId: string; commentId: string }) {
  return await axios.put(
    `${getBaseUrl()}/posts/${postId}/comments/${commentId}/like`,
    {},
    {
      headers: {
        token: getToken(),
      },
    }
  );
}

// =========================
// 4. Add Reply to Comment (بناءً على الـ Endpoint اللي بعتها)
// =========================
export async function addCommentReplyApi({
  postId,
  commentId,
  content,
}: {
  postId: string;
  commentId: string;
  content: string;
}) {
  return await axios.post(
    `${getBaseUrl()}/posts/${postId}/comments/${commentId}/replies`,
    { content },
    {
      headers: {
        token: getToken(),
      },
    }
  );
}

// 5. Get Replies of a Comment
export async function getCommentRepliesApi({
  postId,
  commentId,
}: {
  postId: string;
  commentId: string;
}) {
  return await axios.get(
    `${getBaseUrl()}/posts/${postId}/comments/${commentId}/replies`,
    { headers: { token: getToken() } }
  );
}
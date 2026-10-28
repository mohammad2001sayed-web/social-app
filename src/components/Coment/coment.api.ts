import axios from "axios";

const getBaseUrl = () =>
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BASE_URL 
 

const getToken = () => localStorage.getItem("tkn") || "";

// دالة حذف التعليق
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

// دالة تعديل التعليق
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
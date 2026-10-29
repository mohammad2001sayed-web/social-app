import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// عدد الإشعارات اللي لسه متقرتش
// لو الـ endpoint عندك مختلف، غيّريه هنا بس
export async function getUnreadCount(): Promise<number> {
  const res = await axios.get(`${BASE_URL}/notifications/unread-count`, {
    headers: { token: localStorage.getItem("tkn") },
  });
  const data = res.data?.data ?? res.data;
  return Number(data?.unreadCount ?? data?.count ?? 0) || 0;
}

// رفع صورة البروفايل (من الـ dropdown)
export async function uploadProfilePhoto(file: File) {
  const formData = new FormData();
  formData.append("photo", file);

  return await axios.put(`${BASE_URL}/users/upload-photo`, formData, {
    headers: { token: localStorage.getItem("tkn") },
  });
}
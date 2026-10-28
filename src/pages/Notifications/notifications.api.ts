import axios from "axios";

const getBaseUrl = () =>
  import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL;

const authHeaders = () => ({
  headers: { token: localStorage.getItem("tkn") || "" },
});

/* =========================================================
   Types
========================================================= */
export type NotificationKind =
  | "like"
  | "comment"
  | "reply"
  | "share"
  | "follow"
  | "other";

export interface AppNotification {
  id: string;
  isRead: boolean;
  createdAt: string;
  kind: NotificationKind;
  text: string; // "liked your post", ...
  actor: { id?: string; name: string; photo?: string } | null;
  postId?: string;
}

export interface NotificationsPage {
  items: AppNotification[];
  page: number;
  hasMore: boolean;
}

/* =========================================================
   Normalizer
   مش عارفين الشكل الحرفي للـ response، فبنقبل أكتر من اسم للحقل.
   لو في حاجة مش بتظهر صح، اعمل console.log لأول إشعار وعدّل هنا بس.
========================================================= */
function detectKind(type: string): NotificationKind {
  const t = type.toLowerCase();
  if (t.includes("like") || t.includes("react")) return "like";
  if (t.includes("reply")) return "reply";
  if (t.includes("comment")) return "comment";
  if (t.includes("share")) return "share";
  if (t.includes("follow")) return "follow";
  return "other";
}

function describe(kind: NotificationKind, type: string, fallback?: string) {
  const onComment = type.toLowerCase().includes("comment");
  switch (kind) {
    case "like":
      return onComment ? "liked your comment" : "liked your post";
    case "comment":
      return "commented on your post";
    case "reply":
      return "replied to your comment";
    case "share":
      return "shared your post";
    case "follow":
      return "started following you";
    default:
      return fallback || "sent you a notification";
  }
}

export function normalizeNotification(n: any): AppNotification {
  const type = String(n.type ?? n.kind ?? "");
  const kind = detectKind(type);

  const actorRaw = n.actor ?? n.sender ?? n.from ?? n.user ?? null;
  const entity = n.entity ?? null;
  const entityType = String(n.entityType ?? "").toLowerCase();

  // entityType = "post"    → entityId هو ID البوست نفسه (لايك / شير)
  // entityType = "comment" → entityId هو ID الكومنت، والبوست جوه entity.post
  // entityType = "user"    → مفيش بوست (متابعة)
  let postId: string | undefined;
  if (entityType === "comment") {
    postId =
      entity?.post?._id ??
      (typeof entity?.post === "string" ? entity.post : undefined) ??
      entity?.postId ??
      n.post?._id ??
      (typeof n.post === "string" ? n.post : undefined) ??
      n.postId;
  } else if (entityType !== "user") {
    postId = entity?._id ?? n.entityId ?? n.postId;
  }

  return {
    id: String(n._id ?? n.id),
    isRead: Boolean(n.isRead ?? n.read ?? false),
    createdAt: n.createdAt ?? n.date ?? new Date().toISOString(),
    kind,
    text: describe(kind, type, n.message ?? n.text),
    actor: actorRaw
      ? {
          id: actorRaw._id ?? actorRaw.id,
          name: actorRaw.name ?? actorRaw.username ?? "Someone",
          photo: actorRaw.photo ?? actorRaw.avatar,
        }
      : null,
    postId,
  };
}

/* =========================================================
   Requests
========================================================= */
export async function getNotificationsApi({
  unread,
  page,
  limit = 10,
}: {
  unread: boolean;
  page: number;
  limit?: number;
}): Promise<NotificationsPage> {
  const res = await axios.get(
    `${getBaseUrl()}/notifications?unread=${unread}&page=${page}&limit=${limit}`,
    authHeaders(),
  );

  const d = res.data;
  const raw = d?.data?.notifications ?? d?.notifications ?? d?.data ?? [];
  const list: any[] = Array.isArray(raw) ? raw : [];

  const pg = d?.meta?.pagination;
  const hasMore = pg
    ? (pg.numberOfPages ?? pg.totalPages ?? 1) > (pg.currentPage ?? page)
    : list.length === limit;

  return { items: list.map(normalizeNotification), page, hasMore };
}

export async function getUnreadCountApi(): Promise<number> {
  const res = await axios.get(
    `${getBaseUrl()}/notifications/unread-count`,
    authHeaders(),
  );

  const d = res.data;
  const v =
    d?.data?.unreadCount ??
    d?.data?.count ??
    d?.unreadCount ??
    d?.count ??
    d?.data;

  if (typeof v === "number") return v;
  return Number(v?.unreadCount ?? v?.count ?? 0) || 0;
}

export async function markNotificationReadApi(id: string) {
  return axios.patch(
    `${getBaseUrl()}/notifications/${id}/read`,
    {},
    authHeaders(),
  );
}

export async function markAllNotificationsReadApi() {
  return axios.patch(
    `${getBaseUrl()}/notifications/read-all`,
    {},
    authHeaders(),
  );
}
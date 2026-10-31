import { useState } from "react";
import { useNavigate } from "react-router";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Like1,
  MessageText,
  Share,
  UserAdd,
  Notification,
  TickCircle,
} from "iconsax-react";
import {
  getNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  type AppNotification,
  type NotificationKind,
} from "./notifications.api";
import { useUnreadCount } from "../../components/NotificationBell/NotificationBell";

/* =========================================================
   Helpers
========================================================= */
function timeAgo(dateStr: string) {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const kindStyle: Record<
  NotificationKind,
  { bg: string; icon: React.ReactNode }
> = {
  like: {
    bg: "bg-[#2dc442]",
    icon: <Like1 size="12" variant="Bold" color="#fff" />,
  },
  comment: {
    bg: "bg-sky-500",
    icon: <MessageText size="12" variant="Bold" color="#fff" />,
  },
  reply: {
    bg: "bg-sky-500",
    icon: <MessageText size="12" variant="Bold" color="#fff" />,
  },
  share: {
    bg: "bg-purple-500",
    icon: <Share size="12" variant="Bold" color="#fff" />,
  },
  follow: {
    bg: "bg-indigo-500",
    icon: <UserAdd size="12" variant="Bold" color="#fff" />,
  },
  other: {
    bg: "bg-gray-500",
    icon: <Notification size="12" variant="Bold" color="#fff" />,
  },
};

function NotificationAvatar({ n }: { n: AppNotification }) {
  const [failed, setFailed] = useState(false);
  const name = n.actor?.name || "U";
  const { bg, icon } = kindStyle[n.kind];

  return (
    <div className="relative shrink-0">
      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-300 text-sm font-semibold text-gray-700 dark:bg-slate-700 dark:text-gray-100">
        {n.actor?.photo && !failed ? (
          <img
            src={n.actor.photo}
            alt={name}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>
      <span
        className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-900 ${bg}`}
      >
        {icon}
      </span>
    </div>
  );
}

function NotificationItem({
  n,
  onOpen,
}: {
  n: AppNotification;
  onOpen: (n: AppNotification) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(n)}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-start transition-colors ${
        n.isRead
          ? "hover:bg-gray-100 dark:hover:bg-slate-800"
          : "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20"
      }`}
    >
      <NotificationAvatar n={n} />

      <div className="min-w-0 flex-1">
        <p className="text-[15px] leading-snug text-gray-800 dark:text-gray-100">
          <span className="font-semibold">{n.actor?.name || "Someone"}</span>{" "}
          {n.text}
        </p>
        <p
          className={`mt-0.5 text-xs ${
            n.isRead
              ? "text-gray-500 dark:text-gray-400"
              : "font-semibold text-indigo-600 dark:text-indigo-400"
          }`}
        >
          {timeAgo(n.createdAt)}
        </p>
      </div>

      {!n.isRead && (
        <span
          aria-label="Unread"
          className="h-3 w-3 shrink-0 rounded-full bg-indigo-500"
        />
      )}
    </button>
  );
}

function SkeletonRows() {
  return (
    <div className="flex flex-col gap-1" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 p-3">
          <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/4 rounded bg-gray-200 dark:bg-slate-800" />
            <div className="h-3 w-1/4 rounded bg-gray-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-3 pb-1 pt-3 text-sm font-bold text-gray-900 dark:text-gray-100">
      {children}
    </h2>
  );
}

/* =========================================================
   Page
========================================================= */
export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"all" | "unread">("all");

  const { data: unreadCount = 0 } = useUnreadCount();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["notifications", tab],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getNotificationsApi({ unread: tab === "unread", page: pageParam }),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    refetchOnWindowFocus: true,
  });

  const items: AppNotification[] = data?.pages.flatMap((p) => p.items) ?? [];
  const fresh = items.filter((n) => !n.isRead);
  const earlier = items.filter((n) => n.isRead);

  function refreshAll() {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
  }

  const { mutate: markOne } = useMutation({
    mutationFn: markNotificationReadApi,
    onSuccess: refreshAll,
  });

  const { mutate: markAll, isPending: isMarkingAll } = useMutation({
    mutationFn: markAllNotificationsReadApi,
    onSuccess: () => {
      toast.success("All notifications marked as read");
      refreshAll();
    },
    onError: () => toast.error("Failed to mark all as read"),
  });

  function openNotification(n: AppNotification) {
    if (!n.isRead) markOne(n.id);

    if (n.kind === "follow" && n.actor?.id) {
      navigate(`/user-posts/${n.actor.id}`);
    } else if (n.postId) {
      navigate(`/PostDetails/${n.postId}`);
    } else if (n.actor?.id) {
      navigate(`/user-posts/${n.actor.id}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:mt-12 transition-colors duration-300 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Header */}
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount} new
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => markAll()}
              disabled={unreadCount === 0 || isMarkingAll}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
            >
              <TickCircle size="18" color="currentColor" />
              {isMarkingAll ? "Marking..." : "Mark all as read"}
            </button>
          </header>

          {/* Tabs */}
          <div className="flex gap-2 px-5 pt-4" role="tablist">
            {(["all", "unread"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                  tab === t
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="p-2 pb-4">
            {isLoading ? (
              <SkeletonRows />
            ) : isError ? (
              <div className="py-16 text-center">
                <p className="text-sm text-red-500">
                  {(error as Error)?.message || "Failed to load notifications"}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-3 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Try again
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center">
                <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
                  <Notification size="32" color="#9ca3af" />
                </span>
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  {tab === "unread"
                    ? "You're all caught up"
                    : "No notifications yet"}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {tab === "unread"
                    ? "New notifications will show up here."
                    : "When someone likes, comments or shares, you'll see it here."}
                </p>
              </div>
            ) : (
              <>
                {fresh.length > 0 && (
                  <section>
                    <SectionTitle>New</SectionTitle>
                    {fresh.map((n) => (
                      <NotificationItem
                        key={n.id}
                        n={n}
                        onOpen={openNotification}
                      />
                    ))}
                  </section>
                )}

                {earlier.length > 0 && (
                  <section>
                    <SectionTitle>Earlier</SectionTitle>
                    {earlier.map((n) => (
                      <NotificationItem
                        key={n.id}
                        n={n}
                        onOpen={openNotification}
                      />
                    ))}
                  </section>
                )}

                {hasNextPage && (
                  <div className="flex justify-center pt-4">
                    <button
                      type="button"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="cursor-pointer rounded-lg bg-gray-100 px-6 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-slate-800 dark:text-gray-100 dark:hover:bg-slate-700"
                    >
                      {isFetchingNextPage ? "Loading..." : "See previous notifications"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
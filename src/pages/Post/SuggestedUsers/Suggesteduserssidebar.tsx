import { useEffect, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { UserAdd, TickCircle, Refresh2 } from "iconsax-react";
import { getSuggestedUsersPageApi, followUserApi } from "../Post.api";

const LIMIT = 5;
// بنختار صفحة عشوائية من أول 30 صفحة عشان نجيب ناس مختلفين كل مرة
const MAX_RANDOM_PAGE = 30;
const randomPage = (max = MAX_RANDOM_PAGE) =>
  1 + Math.floor(Math.random() * Math.max(1, max));

function UserAvatar({
  name,
  src,
  size = 44,
}: {
  name?: string;
  src?: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-xs font-semibold text-gray-700 ring-2 ring-gray-100 dark:bg-slate-700 dark:text-gray-100 dark:ring-slate-800"
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name || "user"}
          width={size}
          height={size}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        (name || "U").substring(0, 2).toUpperCase()
      )}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-gray-100 dark:divide-slate-800" aria-hidden>
      {Array.from({ length: LIMIT }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 px-4 py-3">
          <div className="h-11 w-11 rounded-full bg-gray-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/2 rounded bg-gray-200 dark:bg-slate-800" />
            <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-slate-800" />
          </div>
          <div className="h-9 w-20 rounded-lg bg-gray-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

export default function SuggestedUsersSidebar() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(() => randomPage());
  const [removed, setRemoved] = useState<string[]>([]);
  const [followed, setFollowed] = useState<string[]>([]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["suggestedSidebar", page],
    queryFn: () => getSuggestedUsersPageApi({ page, limit: LIMIT }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });

  // لو الصفحة العشوائية طلعت فاضية (حساب اقتراحاته أقل) نرجع للأولى
  useEffect(() => {
    if (data && data.users.length === 0 && page !== 1) setPage(1);
  }, [data, page]);

  const users = (data?.users ?? []).filter((u: any) => !removed.includes(u._id));

  const {
    mutate: handleFollow,
    isPending,
    variables: pendingId,
  } = useMutation({
    mutationFn: (userId: string) => followUserApi(userId),
    onSuccess: (_res, userId) => {
      toast.success("Started following user!");
      setFollowed((prev) => [...prev, userId]);
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["allPost"] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to follow user"),
  });

  // اعرض ناس تانيين
  function showOthers() {
    const max = Math.min(data?.totalPages ?? MAX_RANDOM_PAGE, MAX_RANDOM_PAGE);
    let next = page;
    for (let i = 0; i < 5 && next === page; i++) next = randomPage(max);
    setPage(next);
    setRemoved([]);
    setFollowed([]);
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#18181B]">
      {/* Header */}
      <header className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3.5 dark:border-slate-800">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
          People you may know
        </h3>
        <button
          type="button"
          onClick={showOthers}
          disabled={isFetching}
          aria-label="Show different people"
          title="Show different people"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-slate-800"
        >
          <Refresh2
            size="20"
            color="currentColor"
            className={isFetching ? "animate-spin" : ""}
          />
        </button>
      </header>

      {/* List */}
      <div
        className={`transition-opacity ${
          isFetching && !isLoading ? "opacity-60" : "opacity-100"
        }`}
      >
        {isLoading ? (
          <SkeletonRows />
        ) : users.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No suggestions right now.
            </p>
            <button
              type="button"
              onClick={showOthers}
              className="mt-3 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Show others
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-slate-800">
            {users.map((user: any) => {
              const isFollowed = followed.includes(user._id);
              const isThisPending = isPending && pendingId === user._id;

              return (
                <li
                  key={user._id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/40"
                >
                  <Link to={`/user-posts/${user._id}`} className="shrink-0">
                    <UserAvatar name={user.name} src={user.photo} />
                  </Link>

                  <Link
                    to={`/user-posts/${user._id}`}
                    className="min-w-0 flex-1"
                  >
                    <p className="truncate text-sm font-semibold text-gray-900 hover:underline dark:text-gray-100">
                      {user.name}
                    </p>
                    {user.username && (
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        @{user.username}
                      </p>
                    )}
                  </Link>

                  {isFollowed ? (
                    <span className="flex shrink-0 items-center gap-1 rounded-lg bg-green-100 px-3 py-2 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                      <TickCircle size="16" color="currentColor" />
                      Following
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleFollow(user._id)}
                      disabled={isThisPending}
                      aria-label={`Follow ${user.name}`}
                      className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <UserAdd size="16" color="currentColor" />
                      {isThisPending ? "..." : "Follow"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setRemoved((prev) => [...prev, user._id])}
                    aria-label={`Remove ${user.name}`}
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-100"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 py-3 text-center dark:border-slate-800">
        <Link
          to="/suggestions"
          className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          See all
        </Link>
      </footer>
    </section>
  );
}
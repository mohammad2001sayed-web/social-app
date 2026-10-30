import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { ArrowLeft2, ArrowRight2, UserAdd, TickCircle } from "iconsax-react";
import { getSuggestedUsersPageApi, followUserApi } from "../Post.api";

const LIMIT = 5;

/* =========================================================
   Avatar بمقاس ثابت (مش معتمد على مقاس HeroUI)
========================================================= */
function UserAvatar({
  name,
  src,
  size = 52,
}: {
  name?: string;
  src?: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-sm font-semibold text-gray-700 dark:bg-slate-700 dark:text-gray-100"
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name || "user"}
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

function followersOf(user: any): number {
  return (
    user.followersCount ??
    user.followers_count ??
    (Array.isArray(user.followers) ? user.followers.length : undefined) ??
    0
  );
}

function SkeletonRows() {
  return (
    <div aria-hidden>
      {Array.from({ length: LIMIT }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-4 border-t border-gray-100 px-5 py-4 dark:border-slate-800"
        >
          <div className="h-13 w-13 rounded-full bg-gray-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-slate-800" />
            <div className="h-3 w-1/4 rounded bg-gray-200 dark:bg-slate-800" />
          </div>
          <div className="h-10 w-24 rounded-xl bg-gray-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

export default function SuggestedUsersPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [removed, setRemoved] = useState<string[]>([]); // اتشالوا بالـ X
  const [followed, setFollowed] = useState<string[]>([]); // اتعمل لهم Follow

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["suggestionsPage", page],
    queryFn: () => getSuggestedUsersPageApi({ page, limit: LIMIT }),
    placeholderData: keepPreviousData, // الصفحة القديمة تفضل ظاهرة لحد ما الجديدة توصل
  });

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
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to follow user"),
  });

  function goTo(next: number) {
    setPage(next);
  }

  // نافذة أرقام الصفحات: 5 أرقام حوالين الصفحة الحالية
  const lastPage = data?.totalPages;
  const WINDOW = 5;
  let startPage = Math.max(1, page - Math.floor(WINDOW / 2));
  if (lastPage) {
    startPage = Math.max(1, Math.min(startPage, lastPage - WINDOW + 1));
  }
  const endPage = lastPage
    ? Math.min(lastPage, startPage + WINDOW - 1)
    : page + (data?.hasNext ? 1 : 0);
  const pageNumbers = Array.from(
    { length: Math.max(1, endPage - startPage + 1) },
    (_, i) => startPage + i,
  );

  const pagerBtn =
    "flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 px-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-gray-100 dark:hover:bg-slate-800";

  return (
    <div className="min-h-screen lg:px-4 transition-colors duration-300 ">
      <div className="mx-auto max-w-2xl">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#18181B]">
          {/* Header */}
          <header className="px-5 pb-4 pt-5">
            <div className="flex items-center gap-3">
              <span className="h-6 w-1.5 rounded-full bg-gray-900 dark:bg-white" />
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                People you may know
              </h1>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Find familiar faces from your community.
            </p>
          </header>

          {/* List */}
          <div
            className={`transition-opacity ${
              isFetching && !isLoading ? "opacity-60" : "opacity-100"
            }`}
          >
            {isLoading ? (
              <SkeletonRows />
            ) : isError ? (
              <div className="border-t border-gray-100 py-16 text-center dark:border-slate-800">
                <p className="text-sm text-red-500">
                  {(error as Error)?.message || "Failed to load suggestions"}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-3 cursor-pointer rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  Try again
                </button>
              </div>
            ) : users.length === 0 ? (
              <div className="border-t border-gray-100 py-16 text-center dark:border-slate-800">
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  No more suggestions here
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {page > 1
                    ? "Try going back to the previous page."
                    : "Check back later for new people."}
                </p>
              </div>
            ) : (
              users.map((user: any) => {
                const isFollowed = followed.includes(user._id);
                const isThisPending = isPending && pendingId === user._id;
                const count = followersOf(user);

                return (
                  <div
                    key={user._id}
                    className="flex items-center gap-4 border-t border-gray-100 px-5 py-4 dark:border-slate-800"
                  >
                    <Link to={`/user-posts/${user._id}`} className="shrink-0">
                      <UserAvatar name={user.name} src={user.photo} />
                    </Link>

                    <Link
                      to={`/user-posts/${user._id}`}
                      className="min-w-0 flex-1"
                    >
                      <p className="truncate font-semibold text-gray-900 hover:underline dark:text-gray-100">
                        {user.name}
                      </p>
                      {user.username && (
                        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                        {count} {count === 1 ? "follower" : "followers"}
                      </p>
                    </Link>

                    {isFollowed ? (
                      <span className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:bg-slate-800 dark:text-gray-300">
                        <TickCircle size="18" color="currentColor" />
                        Following
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleFollow(user._id)}
                        disabled={isThisPending}
                        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                      >
                        <UserAdd size="18" color="currentColor" />
                        {isThisPending ? "Following..." : "Follow"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setRemoved((prev) => [...prev, user._id])
                      }
                      aria-label={`Remove ${user.name}`}
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-gray-200"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden
                      >
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 dark:border-slate-800">
            <nav
              aria-label="Pagination"
              className="flex flex-wrap items-center gap-1.5"
            >
              {/* « أول صفحة */}
              <button
                type="button"
                onClick={() => goTo(1)}
                disabled={page === 1}
                aria-label="First page"
                className={pagerBtn}
              >
                <span className="flex -space-x-2.5">
                  <ArrowLeft2 size="16" color="currentColor" />
                  <ArrowLeft2 size="16" color="currentColor" />
                </span>
              </button>

              {/* ‹ السابق */}
              <button
                type="button"
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
                className={pagerBtn}
              >
                <ArrowLeft2 size="16" color="currentColor" />
              </button>

              {/* أرقام الصفحات */}
              {pageNumbers.map((n) =>
                n === page ? (
                  <span
                    key={n}
                    aria-current="page"
                    className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-gray-900 px-3 text-sm font-bold text-white dark:bg-white dark:text-gray-900"
                  >
                    {n}
                  </span>
                ) : (
                  <button
                    key={n}
                    type="button"
                    onClick={() => goTo(n)}
                    aria-label={`Page ${n}`}
                    className={pagerBtn}
                  >
                    {n}
                  </button>
                ),
              )}

              {/* › التالي */}
              <button
                type="button"
                onClick={() => goTo(page + 1)}
                disabled={!data?.hasNext}
                aria-label="Next page"
                className={pagerBtn}
              >
                <ArrowRight2 size="16" color="currentColor" />
              </button>

              {/* » آخر صفحة */}
              <button
                type="button"
                onClick={() => lastPage && goTo(lastPage)}
                disabled={!lastPage || page === lastPage}
                aria-label="Last page"
                className={pagerBtn}
              >
                <span className="flex -space-x-2.5">
                  <ArrowRight2 size="16" color="currentColor" />
                  <ArrowRight2 size="16" color="currentColor" />
                </span>
              </button>
            </nav>

            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page <strong className="text-gray-900 dark:text-gray-100">{page}</strong>
              {lastPage ? ` of ${lastPage}` : ""}
            </span>
          </footer>
        </section>
      </div>
    </div>
  );
}
import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link } from "react-router";
import toast from "react-hot-toast";
import {
  ArrowLeft2,
  ArrowRight2,
  UserAdd,
  TickCircle,
  People,
} from "iconsax-react";
import { getSuggestedUsersPageApi, followUserApi } from "../Post.api";

const LIMIT = 5;

/* =========================================================
   الأنيميشن: keyframes بسيطة من غير أي مكتبة.
   وكلها بتقف لو الجهاز مفعّل "تقليل الحركة".
========================================================= */
const ANIMATIONS = `
@keyframes su-fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: none; }
}
@keyframes su-pop {
  0%   { opacity: 0; transform: scale(.6); }
  60%  { opacity: 1; transform: scale(1.12); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes su-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50%      { transform: translateY(-14px) scale(1.06); }
}
@keyframes su-shine {
  from { transform: translateX(-130%) skewX(-20deg); }
  to   { transform: translateX(330%) skewX(-20deg); }
}
.su-fade-up { animation: su-fade-up .5s cubic-bezier(.2,.8,.2,1) both; }
.su-pop     { animation: su-pop .45s ease-out both; }
.su-float   { animation: su-float 7s ease-in-out infinite; }
.su-btn:hover .su-shine { animation: su-shine .8s ease-out; }
@media (prefers-reduced-motion: reduce) {
  .su-fade-up, .su-pop, .su-float, .su-btn:hover .su-shine { animation: none !important; }
}
`;

/* =========================================================
   Avatar بمقاس ثابت (مش معتمد على مقاس HeroUI)
========================================================= */
function UserAvatar({
  name,
  src,
  size = 56,
}: {
  name?: string;
  src?: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-sm font-semibold text-gray-700 ring-2 ring-gray-100 transition-all duration-300 group-hover:scale-105 group-hover:ring-indigo-500 dark:bg-slate-700 dark:text-gray-100 dark:ring-slate-800 dark:group-hover:ring-indigo-400"
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
    <div className="divide-y divide-gray-100 dark:divide-slate-800" aria-hidden>
      {Array.from({ length: LIMIT }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
          <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-slate-800" />
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
  const [dismissing, setDismissing] = useState<string[]>([]); // بيتشالوا (أنيميشن)
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

  // الصف يتزحلق ويختفي، وبعدها يتشال فعلًا
  function dismiss(userId: string) {
    setDismissing((prev) => [...prev, userId]);
    setTimeout(() => setRemoved((prev) => [...prev, userId]), 300);
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
    "flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 px-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800";

  return (
    <div className="relative min-h-screen  overflow-hidden bg-gray-100 px-3 py-6 md:mt-6 transition-colors duration-300 sm:px-4 dark:bg-[#0b0b0f]">
      <style>{ANIMATIONS}</style>

      {/* ديكور الخلفية: دواير ملونة بتتحرك ببطء */}
      <span
        aria-hidden
        className="su-float pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl"
      />
      <span
        aria-hidden
        className="su-float pointer-events-none absolute -right-24 top-1/2 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative mx-auto max-w-125">
        <section className="su-fade-up overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-indigo-900/5 dark:border-slate-800 dark:bg-[#18181B]">
          {/* Hero */}
          <header className="relative overflow-hidden bg-linear-to-br from-indigo-700 via-violet-700 to-purple-600 px-6 py-8 text-white">
            <span
              aria-hidden
              className="su-float absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15"
            />
            <span
              aria-hidden
              className="su-float absolute -bottom-12 left-1/3 h-28 w-28 rounded-full bg-white/10"
              style={{ animationDelay: "1.5s" }}
            />
            <span
              aria-hidden
              className="su-float absolute right-1/4 top-5 h-8 w-8 rounded-full bg-sky-300/30"
              style={{ animationDelay: "3s" }}
            />

            <div className="relative flex items-center gap-4">
              <span className="su-pop flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
                <People size="30" variant="Bold" color="currentColor" />
              </span>
              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold tracking-tight">
                  People you may know
                </h1>
                <p className="mt-1 text-sm text-white/90">
                  Find familiar faces from your community.
                </p>
              </div>
            </div>
          </header>

          {/* List: min-height ثابت عشان الصفحة ماتقفزش لما الصفوف تتغير */}
          <div
            className={`min-h-110 transition-opacity duration-300 ${
              isFetching && !isLoading ? "opacity-50" : "opacity-100"
            }`}
          >
            {isLoading ? (
              <SkeletonRows />
            ) : isError ? (
              <div className="py-16 text-center">
                <p className="text-sm text-red-500">
                  {(error as Error)?.message || "Failed to load suggestions"}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-3 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Try again
                </button>
              </div>
            ) : users.length === 0 ? (
              <div className="su-fade-up py-16 text-center">
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
              <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                {users.map((user: any, i: number) => {
                  const isFollowed = followed.includes(user._id);
                  const isThisPending = isPending && pendingId === user._id;
                  const isDismissing = dismissing.includes(user._id);
                  const count = followersOf(user);

                  return (
                    <li
                      key={user._id}
                      className={`grid transition-all duration-300 ease-out ${
                        isDismissing
                          ? "grid-rows-[0fr] -translate-x-6 opacity-0"
                          : "grid-rows-[1fr] opacity-100"
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div
                          className="su-fade-up"
                          style={{ animationDelay: `${i * 70}ms` }}
                        >
                          <div
                            className={`group flex items-center gap-3 px-4 py-4 transition-colors duration-300 sm:gap-4 sm:px-5 ${
                              isFollowed
                                ? "bg-green-50/70 dark:bg-green-500/5"
                                : "hover:bg-indigo-50/60 dark:hover:bg-indigo-500/5"
                            }`}
                          >
                            <Link
                              to={`/user-posts/${user._id}`}
                              className="shrink-0"
                            >
                              <UserAvatar name={user.name} src={user.photo} />
                            </Link>

                            <Link
                              to={`/user-posts/${user._id}`}
                              className="min-w-0 flex-1"
                            >
                              <p className="truncate font-semibold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-400">
                                {user.name}
                              </p>
                              {user.username && (
                                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                  @{user.username}
                                </p>
                              )}
                              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-slate-800 dark:text-gray-300">
                                <People size="12" color="currentColor" />
                                {count} {count === 1 ? "follower" : "followers"}
                              </span>
                            </Link>

                            {isFollowed ? (
                              <span className="su-pop flex shrink-0 items-center gap-1.5 rounded-xl bg-green-100 px-3 py-2.5 text-sm font-semibold text-green-700 sm:px-4 dark:bg-green-500/10 dark:text-green-400">
                                <TickCircle
                                  size="18"
                                  variant="Bold"
                                  color="currentColor"
                                />
                                <span className="hidden sm:inline">
                                  Following
                                </span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleFollow(user._id)}
                                disabled={isThisPending}
                                aria-label={`Follow ${user.name}`}
                                className="su-btn relative flex shrink-0 cursor-pointer items-center gap-1.5 overflow-hidden rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-600/40 active:scale-95 disabled:opacity-60 sm:px-4"
                              >
                                <span
                                  aria-hidden
                                  className="su-shine pointer-events-none absolute inset-y-0 left-0 w-1/4 -translate-x-full bg-white/30"
                                />
                                <UserAdd
                                  size="18"
                                  color="currentColor"
                                  className={isThisPending ? "animate-pulse" : ""}
                                />
                                <span className="hidden sm:inline">
                                  {isThisPending ? "Following..." : "Follow"}
                                </span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => dismiss(user._id)}
                              aria-label={`Remove ${user.name}`}
                              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-all duration-200 hover:rotate-90 hover:bg-red-100 hover:text-red-600 active:scale-90 dark:text-gray-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
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
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Pagination */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-4 py-4 sm:px-5 dark:border-slate-800 dark:bg-black/20">
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
                    className="su-pop flex h-10 min-w-10 scale-110 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 px-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/40"
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
              Page{" "}
              <strong className="text-gray-900 dark:text-gray-100">{page}</strong>
              {lastPage ? ` of ${lastPage}` : ""}
            </span>
          </footer>
        </section>
      </div>
    </div>
  );
}
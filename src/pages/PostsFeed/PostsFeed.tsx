import { useInfiniteQuery } from "@tanstack/react-query";
import { getPostsPageApi } from "../Post/Post.api";
import { useInfiniteScroll } from "./useInfiniteScroll";
import PostCard from "../Post/PostCard/PostCard";
const PAGE_SIZE = 10;

function PostSkeleton() {
  return (
    <div
      className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-[#18181B]"
      aria-hidden
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-slate-800" />
          <div className="h-2.5 w-1/5 rounded bg-gray-200 dark:bg-slate-800" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-gray-200 dark:bg-slate-800" />
        <div className="h-3 w-4/5 rounded bg-gray-200 dark:bg-slate-800" />
      </div>
      <div className="mt-4 h-40 rounded-xl bg-gray-200 dark:bg-slate-800" />
    </div>
  );
}

export default function PostsFeed() {
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
    // بيبدأ بـ "allPost" عشان أي invalidateQueries(["allPost"]) يحدّثه
    queryKey: ["allPost", "feed"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getPostsPageApi({ page: pageParam, limit: PAGE_SIZE }),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });

  // شيل أي بوست اتكرر (لو في بوست جديد اتضاف والصفحات اتزحزحت)
  const seen = new Set<string>();
  const posts = (data?.pages.flatMap((p) => p.posts) ?? []).filter((p) => {
    if (seen.has(p._id)) return false;
    seen.add(p._id);
    return true;
  });

  const sentinelRef = useInfiniteScroll(
    () => fetchNextPage(),
    !!hasNextPage && !isFetchingNextPage && !isError,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (isError && posts.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-[#18181B]">
        <p className="text-sm text-red-500">
          {(error as Error)?.message || "Failed to load posts"}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="py-16 text-center text-lg text-gray-500 dark:text-gray-400">
        No posts yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}

      {/* العنصر اللي بيراقبه الـ observer */}
      <div ref={sentinelRef} className="h-1" aria-hidden />

      {isFetchingNextPage && (
        <div className="flex flex-col gap-4">
          <PostSkeleton />
        </div>
      )}

      {isError && posts.length > 0 && (
        <div className="py-4 text-center">
          <p className="text-sm text-red-500">Couldn't load more posts.</p>
          <button
            type="button"
            onClick={() => fetchNextPage()}
            className="mt-2 cursor-pointer rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-100 dark:hover:bg-slate-700"
          >
            Try again
          </button>
        </div>
      )}

      {!hasNextPage && !isFetchingNextPage && !isError && (
        <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          You're all caught up 🎉
        </p>
      )}
    </div>
  );
}
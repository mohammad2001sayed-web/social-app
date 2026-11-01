import { useEffect } from "react";
import { Link } from "react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Avatar } from "@heroui/react";
import { Like1 } from "iconsax-react";
import { getPostLikesPageApi } from "../Post.api";

export default function LikesModal({
  postId,
  onClose,
}: {
  postId: string;
  onClose: () => void;
}) {
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
    queryKey: ["postLikes", postId],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getPostLikesPageApi({ postId, page: pageParam }),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });

  // Escape يقفل، ومنع سكرول الصفحة اللي ورا
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const seen = new Set<string>();
  const users = (data?.pages.flatMap((p) => p.users) ?? []).filter((u: any) => {
    const id = u._id || u.id;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="People who liked this post"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#18181B]"
      >
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-slate-800">
          <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
            <Like1 size="18" variant="Bold" color="#2dc442" />
            Likes
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-lg px-2 py-1 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </header>

        <div className="min-h-32 flex-1 overflow-y-auto px-5">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-gray-500">Loading...</p>
          ) : isError ? (
            <div className="py-8 text-center">
              <p className="text-sm text-red-500">
                {(error as Error)?.message || "Failed to load likes"}
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
            <p className="py-8 text-center text-sm text-gray-500">
              No likes yet.
            </p>
          ) : (
            <>
              <ul>
                {users.map((u: any) => (
                  <li
                    key={u._id || u.id}
                    className="border-b border-gray-100 last:border-0 dark:border-slate-800"
                  >
                    <Link
                      to={`/user-posts/${u._id || u.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 py-3 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <Avatar.Image src={u.photo} alt={u.name} />
                        <Avatar.Fallback>
                          {(u.name || "U").charAt(0).toUpperCase()}
                        </Avatar.Fallback>
                      </Avatar>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {u.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              {hasNextPage && (
                <div className="flex justify-center py-3">
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="cursor-pointer rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200 disabled:opacity-50 dark:bg-slate-800 dark:text-gray-100 dark:hover:bg-slate-700"
                  >
                    {isFetchingNextPage ? "Loading..." : "Show more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
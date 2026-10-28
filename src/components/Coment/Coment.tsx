import { Avatar } from "@heroui/react";
import { Link } from "react-router";
import { More, Edit2, Trash, Gallery, Like1 } from "iconsax-react";
import { useComent } from "./useComent";
import type { TopComment2 } from "../../pages/Post/Post.interface";

export default function Coment({
  comment,
  postId,
}: {
  comment: TopComment2;
  postId: string;
}) {
  const {
    commentCreator: { name, photo },
    content,
    image,
  } = comment;

  const {
    isEditing,
    setIsEditing,
    menuOpen,
    setMenuOpen,
    confirmDeleteOpen,
    setConfirmDeleteOpen,
    menuRef,
    isMyComment,
    deleteCommentMutation,
    isDeleting,
    isUpdating,
    register,
    handleSubmit,
    reset,
    onSubmit,
    formattedDate,
  } = useComent(comment, postId);

  return (
    <div className="flex items-start gap-3 w-full py-2 group">
      {/* User Avatar */}
      <Link to={`/user-posts/${comment.commentCreator._id}`} className="shrink-0">
        <Avatar className="w-9 h-9">
          <Avatar.Image alt={name} src={photo} />
          <Avatar.Fallback>{name?.charAt(0).toUpperCase()}</Avatar.Fallback>
        </Avatar>
      </Link>

      {/* Comment Content & Options wrapper */}
      <div className="flex-1 min-w-0 relative">
        <div className="flex items-start justify-between gap-2">
          {/* Comment Bubble */}
          <div className="flex-1 bg-gray-100 dark:bg-slate-800/80 rounded-2xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 border border-gray-200/60 dark:border-slate-700/60 shadow-xs">
            
            {/* Header inside bubble */}
            <div className="flex items-center justify-between gap-4 mb-1">
              <Link
                to={`/user-posts/${comment.commentCreator._id}`}
                className="font-semibold text-xs text-gray-900 dark:text-gray-100 hover:underline truncate"
              >
                {name}
              </Link>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {formattedDate}
              </span>
            </div>

            {/* Normal Text & Image */}
            {!isEditing && (
              <div className="space-y-2">
                {content && (
                  <p className="max-w-70 wrap-break-word whitespace-normal text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                    {content}
                  </p>
                )}
                {image && (
                  <img
                    className="max-h-48 w-full rounded-xl object-cover border border-gray-200 dark:border-slate-700 mt-2"
                    src={image}
                    alt={name}
                  />
                )}
              </div>
            )}

            {/* Edit Mode Form inside Bubble */}
            {isEditing && (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2.5 mt-2">
                <textarea
                  {...register("content")}
                  placeholder="Edit your comment..."
                  rows={2}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100"
                />

                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`comment-image-${comment._id}`}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-gray-200 dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    <Gallery size="16" color="currentColor" />
                    Change photo
                  </label>
                  <input
                    id={`comment-image-${comment._id}`}
                    type="file"
                    accept="image/*"
                    {...register("image")}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => {
                      setIsEditing(false);
                      reset({ content: comment.content });
                    }}
                    className="cursor-pointer rounded-lg px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="cursor-pointer rounded-lg bg-indigo-600 px-3.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isUpdating ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 3 Dots Menu */}
          {isMyComment && !isEditing && (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Comment options"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 dark:hover:bg-slate-800"
              >
                <More size="18" color="currentColor" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-[#0f1f38]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setIsEditing(true);
                      reset({ content: comment.content });
                    }}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-800"
                  >
                    <Edit2 size="16" color="currentColor" />
                    Edit comment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmDeleteOpen(true);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <Trash size="16" color="currentColor" />
                    Delete comment
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions: Like & Reply */}
        <div className="flex items-center gap-4 mt-1.5 ml-3 text-xs font-medium text-gray-500 dark:text-gray-400">
          <button className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1">
            <Like1 size="14" color="currentColor" />
            <span>Like</span>
          </button>

          <button className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
            Reply
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={() => !isDeleting && setConfirmDeleteOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#18181B] border border-gray-100 dark:border-slate-800"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Delete this comment?
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              This can't be undone. The comment will be permanently removed.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                disabled={isDeleting}
                className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteCommentMutation()}
                disabled={isDeleting}
                className="cursor-pointer rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
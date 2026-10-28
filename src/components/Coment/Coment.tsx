import { Link } from "react-router";
import { More, Edit2, Trash, Gallery, Like1, Send2 } from "iconsax-react";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/CounterContext/AuthContext/AuthContext";
import { useComent } from "./useComent";
import type { TopComment2 } from "../../pages/Post/Post.interface";
import { timeAgo } from "../../pages/Post/PostCard/timenow";

/* =========================================================
   Avatar بمقاس ثابت: مش معتمد على HeroUI عشان الخط يفضل مظبوط
========================================================= */
function UserAvatar({
  name,
  src,
  size,
}: {
  name?: string;
  src?: string;
  size: number;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-300 text-[11px] font-semibold text-gray-700 dark:bg-slate-700 dark:text-gray-100"
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
        (name || "U").charAt(0).toUpperCase()
      )}
    </div>
  );
}

/* =========================================================
   صف في شجرة الردود
   gutter عرضه 40px: الخط العمودي عند x=15 (نفس مركز أفاتار التعليق 32px)
   والمنحنى بيوصل لحد x=40 (بداية أفاتار الرد)
   الخط بينزل لتحت إلا لو ده آخر صف
========================================================= */
function ThreadRow({
  isLast,
  children,
}: {
  isLast: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <div className="relative w-10 shrink-0" aria-hidden>
        <span className="absolute left-3.75 top-0 h-5 w-6.25 rounded-bl-xl border-b-2 border-l-2 border-gray-300 dark:border-slate-700" />
        {!isLast && (
          <span className="absolute bottom-0 left-3.75 top-5 w-0.5 bg-gray-300 dark:bg-slate-700" />
        )}
      </div>
      <div className="min-w-0 flex-1 pt-2">{children}</div>
    </div>
  );
}

export default function Coment({
  comment,
  postId,
}: {
  comment: TopComment2;
  postId: string;
}) {
  const { userData } = useContext(AuthContext);

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
    showReplyInput,
    setShowReplyInput,
    showReplies,
    setShowReplies,
    replyText,
    setReplyText,
    handleLikeComment,
    handleSendReply,
    isLikedByMe,
    likesCount,
    repliesList,
    repliesCount,
    isLoadingReplies,
    isSendingReply,
  } = useComent(comment, postId);

  const showToggle = !showReplies && repliesCount > 0;
  const showLoading =
    showReplies && isLoadingReplies && repliesList.length === 0;
  const hasChildren = showToggle || showReplies || showReplyInput;

  // عدد الصفوف في الشجرة عشان نعرف مين آخر واحد
  const rowsCount =
    (showToggle ? 1 : 0) +
    (showLoading ? 1 : 0) +
    (showReplies ? repliesList.length : 0) +
    (showReplyInput ? 1 : 0);

  let rowIndex = 0;
  const nextIsLast = () => ++rowIndex === rowsCount;

  function cancelEdit() {
    setIsEditing(false);
    reset({ content: comment.content });
  }

  return (
    <div className="w-full py-1.5">
      {/* =========================
          التعليق الأصلي
      ========================= */}
      <div className="flex gap-2">
        {/* أفاتار + الخط النازل */}
        <div className="flex w-8 shrink-0 flex-col items-center">
          <Link to={`/user-posts/${comment.commentCreator._id}`}>
            <UserAvatar name={name} src={photo} size={32} />
          </Link>
          {hasChildren && (
            <div className="mt-1 w-0.5 flex-1 rounded bg-gray-300 dark:bg-slate-700" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {!isEditing ? (
            <div className="group/bubble flex items-center gap-1">
              <div className="flex min-w-0 max-w-full flex-col items-start">
                {(content || !image) && (
                  <div className="max-w-full rounded-2xl bg-gray-100 px-3 py-2 dark:bg-slate-700">
                    <Link
                      to={`/user-posts/${comment.commentCreator._id}`}
                      className="block text-[13px] font-semibold text-gray-900 hover:underline dark:text-gray-100"
                    >
                      {name}
                    </Link>
                    {content && (
                      <p className="whitespace-pre-wrap wrap-break-word text-[15px] leading-snug text-gray-800 dark:text-gray-100">
                        {content}
                      </p>
                    )}
                  </div>
                )}

                {image && (
                  <div className={content ? "mt-1" : ""}>
                    <img
                      src={image}
                      alt={`${name}'s comment`}
                      loading="lazy"
                      decoding="async"
                      className="max-h-64 max-w-full rounded-2xl border border-gray-200 object-cover dark:border-slate-700"
                    />
                  </div>
                )}
              </div>

              {isMyComment && (
                <div className="relative shrink-0" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Comment options"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-100 focus-visible:opacity-100 dark:text-gray-300 dark:hover:bg-slate-800 md:group-hover/bubble:opacity-100 ${
                      menuOpen ? "md:opacity-100" : "md:opacity-0"
                    }`}
                  >
                    <More size="18" color="currentColor" />
                  </button>

                  {menuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-[#0f1f38]"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setMenuOpen(false);
                          setIsEditing(true);
                          reset({ content: comment.content });
                        }}
                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-slate-800"
                      >
                        <Edit2 size="16" color="currentColor" />
                        Edit
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setMenuOpen(false);
                          setConfirmDeleteOpen(true);
                        }}
                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        <Trash size="16" color="currentColor" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-1.5"
            >
              <div className="flex items-end gap-1 rounded-3xl bg-gray-100 px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/50 dark:bg-slate-700">
                <textarea
                  {...register("content")}
                  rows={1}
                  autoFocus
                  placeholder="Edit your comment..."
                  onKeyDown={(e) => {
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="min-h-7 flex-1 resize-none bg-transparent py-1 text-[15px] text-gray-900 outline-none placeholder:text-gray-500 dark:text-gray-100"
                />

                <label
                  htmlFor={`comment-image-${comment._id}`}
                  aria-label="Change photo"
                  className="mb-0.5 cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-200 dark:hover:bg-slate-700"
                >
                  <Gallery size="20" color="#FF8A65" />
                </label>
                <input
                  id={`comment-image-${comment._id}`}
                  type="file"
                  accept="image/*"
                  {...register("image")}
                  className="hidden"
                />

                <button
                  type="submit"
                  disabled={isUpdating}
                  aria-label="Save"
                  className="mb-0.5 cursor-pointer rounded-full p-1 transition-colors hover:bg-indigo-500/10 disabled:opacity-40"
                >
                  <Send2
                    size="20"
                    variant="Bold"
                    color="#6366f1"
                    className={isUpdating ? "animate-pulse" : ""}
                  />
                </button>
              </div>

              <p className="ms-3 text-xs text-gray-500 dark:text-gray-300">
                Press Esc to{" "}
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="cursor-pointer text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  cancel
                </button>
              </p>
            </form>
          )}

          {/* Like · Reply · التاريخ */}
          {!isEditing && (
            <div className="ms-3 mt-1 flex items-center gap-3 pb-1 text-xs">
              <button
                type="button"
                onClick={() => handleLikeComment()}
                className={`cursor-pointer font-semibold hover:underline ${
                  isLikedByMe
                    ? "text-[#2dc442]"
                    : "text-gray-500 dark:text-gray-300"
                }`}
              >
                Like
              </button>
              <button
                type="button"
                onClick={() => setShowReplyInput((prev) => !prev)}
                className="cursor-pointer font-semibold text-gray-500 hover:underline dark:text-gray-300"
              >
                Reply
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {timeAgo(comment.createdAt)}
                {/* لو عندك متغير بيحدد هل البوست ده مشارك ولا لأ، سيبه */}
                {/* {isShared && " · shared a post"} */}
              </p>

              {likesCount > 0 && (
                <span className="ml-auto flex items-center gap-1 font-medium text-gray-600 dark:text-gray-300">
                  <Like1 size="14" variant="Bold" color="#2dc442" />
                  {likesCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================
          شجرة الردود
      ========================= */}
      {hasChildren && (
        <div className="flex flex-col">
          {/* زرار "View N replies" */}
          {showToggle && (
            <ThreadRow isLast={nextIsLast()}>
              <button
                type="button"
                onClick={() => setShowReplies(true)}
                className="flex h-6 cursor-pointer items-center text-sm font-semibold text-gray-600 hover:underline dark:text-gray-300"
              >
                View {repliesCount} {repliesCount === 1 ? "reply" : "replies"}
              </button>
            </ThreadRow>
          )}

          {showLoading && (
            <ThreadRow isLast={nextIsLast()}>
              <div className="flex h-6 items-center text-sm text-gray-500 dark:text-gray-300">
                Loading replies...
              </div>
            </ThreadRow>
          )}

          {/* الردود */}
         {/* الردود */}
          {showReplies &&
            repliesList.map((reply: any, idx: number) => {
              const author = reply.commentCreator ?? reply.user ?? {};
              
              {/* حساب وقت الرد بالساعات والدقائق زي الكومنتات */}
              const replyTimeAgo = reply.createdAt ? timeAgo(reply.createdAt) : "";
              
              {/* عدد لايكات الرد (لو الـ API بيرجعها) */}
              const replyLikesCount = reply.likes?.length || reply.likesCount || 0;

              return (
                <ThreadRow key={reply._id || idx} isLast={nextIsLast()}>
                  <div className="flex items-start gap-2">
                    <Link to={author._id ? `/user-posts/${author._id}` : "#"}>
                      <UserAvatar
                        name={author.name}
                        src={author.photo}
                        size={24}
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="inline-block max-w-full rounded-2xl bg-gray-100 px-3 py-1.5 dark:bg-slate-800">
                        <h5 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {author.name || "User"}
                        </h5>
                        <p className="whitespace-pre-wrap wrap-break-word text-sm leading-snug text-gray-800 dark:text-gray-200">
                          {reply.content}
                        </p>
                      </div>

                      {/* التاريخ (timeAgo) + عدد اللايكات للرد */}
                      <div className="ms-3 mt-0.5 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                        {replyTimeAgo && <span>{replyTimeAgo}</span>}

                        {replyLikesCount > 0 && (
                          <span className="flex items-center gap-1 font-medium text-gray-600 dark:text-gray-300">
                            <Like1 size="12" variant="Bold" color="#2dc442" />
                            {replyLikesCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </ThreadRow>
              );
            })}

          {/* صندوق كتابة رد */}
          {showReplyInput && (
            <ThreadRow isLast={nextIsLast()}>
              <div className="flex items-start gap-2">
                <UserAvatar
                  name={userData?.name}
                  src={userData?.photo}
                  size={24}
                />

                <div className="flex min-w-0 flex-1 items-center gap-1 rounded-3xl bg-gray-100 px-3 py-1 focus-within:ring-2 focus-within:ring-indigo-500/50 dark:bg-slate-700">
                  <input
                    type="text"
                    autoFocus
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        replyText.trim() &&
                        !isSendingReply
                      ) {
                        e.preventDefault();
                        handleSendReply();
                      }
                      if (e.key === "Escape") setShowReplyInput(false);
                    }}
                    placeholder={`Reply to ${name}...`}
                    className="min-w-0 flex-1 bg-transparent py-1 text-sm text-gray-900 outline-none placeholder:text-gray-500 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={isSendingReply || !replyText.trim()}
                    aria-label="Send reply"
                    className="cursor-pointer rounded-full p-1 transition-colors enabled:hover:bg-indigo-500/10 disabled:opacity-30"
                  >
                    <Send2
                      size="18"
                      variant="Bold"
                      color={replyText.trim() ? "#6366f1" : "#9ca3af"}
                      className={isSendingReply ? "animate-pulse" : ""}
                    />
                  </button>
                </div>
              </div>
            </ThreadRow>
          )}
        </div>
      )}

      {/* =========================
          تأكيد الحذف
      ========================= */}
      {confirmDeleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !isDeleting && setConfirmDeleteOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#18181B]"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Delete this comment?
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              This can't be undone. The comment will be permanently removed.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                disabled={isDeleting}
                className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-slate-800"
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

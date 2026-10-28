import { Avatar } from "@heroui/react";
import type { Post } from "../Post.interface";
import {
  Like1,
  MessageText,
  Share,
  Gallery,
  More,
  Edit2,
  Trash,
} from "iconsax-react";
import Coment from "../../../components/Coment/Coment";
import { Link } from "react-router";
import { AuthContext } from "../../../context/CounterContext/AuthContext/AuthContext";
import { useContext, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FnUpdatePost, FnDeletePost } from "../CreatPost.abi";
import { toggleLikePost } from "../Post.api";

export default function PostCard({
  post,
  PostDetails,
}: {
  post: Post;
  PostDetails?: boolean;
}) {
  const { userData } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const {
    _id,
    commentsCount,
    createdAt,
    user: { name, photo },
    body,
    image,
    topComment,
  } = post;

  const userId = userData?._id || userData?.id;
  const isMyPost = userId === post.user._id;

  const isLikedByMe = post.likes?.some(
    (item: any) =>
      (typeof item === "string" ? item : item?._id || item?.id) === userId,
  );

  // =========================
  // UI state
  // =========================
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [updatedBody, setUpdatedBody] = useState(body || "");
  const [updatedImage, setUpdatedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // اقفل المنيو لما تدوس برّه أو Escape
  useEffect(() => {
    if (!menuOpen) return;

    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // تنظيف الـ preview
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // =========================
  // Mutations
  // =========================
  const { mutate: handleLike } = useMutation({
    mutationFn: () => toggleLikePost(_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPost"] });
      queryClient.invalidateQueries({ queryKey: ["PostDetails", _id] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
  });

  const { mutateAsync: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: FnDeletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPost"] });
      queryClient.invalidateQueries({ queryKey: ["PostDetails", _id] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
  });

  const { mutateAsync: updatePost, isPending: isUpdating } = useMutation({
    mutationFn: ({
      postId,
      body,
      file,
    }: {
      postId: string;
      body?: string;
      file?: File;
    }) => FnUpdatePost(postId, body, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["allPost"] });
      await queryClient.invalidateQueries({ queryKey: ["PostDetails", _id] });
      await queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      closeEdit();
    },
  });

  // =========================
  // Handlers
  // =========================
  function openEdit() {
    setMenuOpen(false);
    setUpdatedBody(body || "");
    setUpdatedImage(null);
    setImagePreview("");
    setIsEditing(true);
  }

  function closeEdit() {
    setIsEditing(false);
    setUpdatedImage(null);
    setImagePreview("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpdatedImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleUpdate() {
    if (!updatedBody.trim() && !updatedImage && !image) {
      toast.error("Please write something or choose an image");
      return;
    }

    toast.promise(
      updatePost({
        postId: _id,
        body: updatedBody,
        file: updatedImage || undefined,
      }),
      {
        loading: "Saving changes...",
        success: "Post updated",
        error: (err: any) =>
          err?.response?.data?.message ||
          err?.message ||
          "Failed to update post",
      },
    );
  }

  function handleDelete() {
    toast
      .promise(deletePost(_id), {
        loading: "Deleting post...",
        success: "Post deleted",
        error: (err: any) =>
          err?.response?.data?.message ||
          err?.message ||
          "Failed to delete post",
      })
      .finally(() => setConfirmOpen(false));
  }

  const formattedDate = new Date(createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const likesCount = post.likes?.length || 0;

  return (
    <div className="container mx-auto px-4">
      <article className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#18181B]">
        {/* =========================
            Header: user + three dots
        ========================= */}
        <header className="flex items-center gap-3 px-4 pt-4">
          <Link
            to={`/user-posts/${post.user._id}`}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <Avatar>
              <Avatar.Image alt={name} src={photo} />
              <Avatar.Fallback>
                {name ? name.substring(0, 2).toUpperCase() : "U"}
              </Avatar.Fallback>
            </Avatar>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-gray-900 hover:underline dark:text-gray-100">
                {name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formattedDate}
              </p>
            </div>
          </Link>

          {isMyPost && !isEditing && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Post options"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
              >
                <More size="22" color="currentColor" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-[#0f1f38]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={openEdit}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-800"
                  >
                    <Edit2 size="18" color="currentColor" />
                    Edit post
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmOpen(true);
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <Trash size="18" color="currentColor" />
                    Delete post
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        {/* =========================
            Content
        ========================= */}
        <div className="px-4 pb-3 pt-3">
          {isEditing ? (
            <div className="flex flex-col gap-3">
              <textarea
                value={updatedBody}
                onChange={(e) => setUpdatedBody(e.target.value)}
                rows={3}
                autoFocus
                placeholder="What's on your mind?"
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none transition-shadow focus:ring-2 focus:ring-indigo-500/50 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100"
              />

              {(imagePreview || image) && (
                <img
                  src={imagePreview || image}
                  alt="Post"
                  className="max-h-96 w-full rounded-xl object-cover"
                />
              )}

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-800"
                >
                  <Gallery size="20" color="#FF8A65" />
                  {image || imagePreview ? "Change photo" : "Add photo"}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="cursor-pointer rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isUpdating ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            body && (
              <p className="whitespace-pre-wrap wrap-break-word text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
                {body}
              </p>
            )
          )}
        </div>

        {/* الصورة بعرض الكارت كله زي فيسبوك */}
        {!isEditing && image && (
          <img
            src={image}
            alt={`${name}'s post`}
            loading="lazy"
            decoding="async"
            className="max-h-150 w-full bg-gray-100 object-cover dark:bg-slate-800"
          />
        )}

        {/* =========================
            Counts
        ========================= */}
        {(likesCount > 0 || commentsCount > 0) && (
          <div className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400">
            <span>
              {likesCount > 0 &&
                `${likesCount} ${likesCount === 1 ? "like" : "likes"}`}
            </span>
            <span>
              {commentsCount > 0 &&
                `${commentsCount} ${commentsCount === 1 ? "comment" : "comments"}`}
            </span>
          </div>
        )}

        {/* =========================
            Action bar: Like / Comment / Share
        ========================= */}
        <div className="mx-4 flex items-center border-t border-gray-200 py-1 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleLike()}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-slate-800 ${
              isLikedByMe
                ? "text-[#2dc442]"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            <Like1
              size="22"
              color="currentColor"
              variant={isLikedByMe ? "Bold" : "Outline"}
            />
            Like
          </button>

          {PostDetails ? (
            <div className="flex flex-1 items-center justify-center gap-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">
              <MessageText size="22" color="currentColor" />
              Comment
            </div>
          ) : (
            <Link
              to={`/PostDetails/${_id}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
            >
              <MessageText size="22" color="currentColor" />
              Comment
            </Link>
          )}

          <button
            type="button"
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
          >
            <Share size="22" color="currentColor" />
            Share
          </button>
        </div>

        {/* =========================
            Top comment
        ========================= */}
        {topComment && !PostDetails && (
          <div className="px-4 pb-4 pt-2">
            <Coment comment={topComment} postId={_id} />
            <Link
              to={`/PostDetails/${_id}`}
              className="mt-2 inline-block text-sm font-medium text-gray-500 hover:underline dark:text-gray-400"
            >
              View all comments
            </Link>
          </div>
        )}
      </article>

      {/* =========================
          Delete confirm modal
      ========================= */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !isDeleting && setConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-title-${_id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#18181B]"
          >
            <h3
              id={`delete-title-${_id}`}
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              Delete this post?
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              This can't be undone. The post and its comments will be removed.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={isDeleting}
                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="cursor-pointer rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
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
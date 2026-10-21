import { Avatar, Card } from "@heroui/react";
import type { Post } from "../Post.interface";
import { Like1, MessageText, Share, DocumentUpload } from "iconsax-react";
import Coment from "../../../components/Coment/Coment";
import { Link } from "react-router";
import { AuthContext } from "../../../context/CounterContext/AuthContext/AuthContext";
import { useContext, useRef, useState } from "react";
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

  const {
    _id,
    commentsCount,
    createdAt,
    user: { name, photo },
    body,
    image,
    topComment,
  } = post;

  // هل البوست بتاعي؟
  const isMyPost = userData?.id === post.user._id;

  const queryClient = useQueryClient();

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);

  // النص الجديد
  const [updatedBody, setUpdatedBody] = useState(body || "");

  // الصورة الجديدة
  const [updatedImage, setUpdatedImage] = useState<File | null>(null);

  // Preview للصورة الجديدة
  const [imagePreview, setImagePreview] = useState<string>("");

  // input بتاع الصورة
  const imageInputRef = useRef<HTMLInputElement>(null);

  // =========================
  // Delete Post Mutation
  // =========================

  const { mutateAsync: deletePost } = useMutation({
    mutationFn: FnDeletePost,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allPost"],
      });

      queryClient.invalidateQueries({
        queryKey: ["PostDetails", post._id],
      });
    },
  });

  const { mutate: handleLike } = useMutation({
    mutationFn: () => toggleLikePost(_id),
    onSuccess: () => {
      // تحديث بيانات البوستات لتعكس عدد اللايكات الجديدة
      queryClient.invalidateQueries({ queryKey: ["allPost"] });
      queryClient.invalidateQueries({ queryKey: ["PostDetails", _id] });
    },
  });
  // 1. تحقق هل البوست مُعجب به من قِبل المستخدم الحالي أم لا
const userId = userData?._id || userData?.id;

const isLikedByMe = post.likes?.some((item: any) => 
  (typeof item === "string" ? item : item?._id || item?.id) === userId
);

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    toast.promise(deletePost(post._id), {
      loading: "Deleting post...",
      success: "Post deleted successfully!",
      error: (err: any) =>
        err?.response?.data?.message || err?.message || "Failed to delete post",
    });
  }

  // =========================
  // Update Post Mutation
  // =========================

  const { mutateAsync: updatePost } = useMutation({
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
      // تحديث كل البوستات
      await queryClient.invalidateQueries({
        queryKey: ["allPost"],
      });

      // تحديث تفاصيل البوست
      await queryClient.invalidateQueries({
        queryKey: ["PostDetails", _id],
      });

      // إغلاق Edit
      setIsEditing(false);

      // تنظيف الصورة الجديدة
      setUpdatedImage(null);
      setImagePreview("");

      // تنظيف input الصورة
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    },
  });

  // =========================
  // اختيار صورة جديدة
  // =========================

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    // لو فيه Preview قديم
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    // نخزن الصورة
    setUpdatedImage(file);

    // نعمل Preview
    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  // =========================
  // فتح Edit
  // =========================

  function handleEdit() {
    setIsEditing(true);

    // نرجع النص الأصلي
    setUpdatedBody(body || "");

    // نمسح أي صورة جديدة قديمة
    setUpdatedImage(null);
    setImagePreview("");

    // تنظيف input
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  // =========================
  // Cancel Edit
  // =========================

  function handleCancel() {
    // رجّع النص الأصلي
    setUpdatedBody(body || "");

    // امسح الصورة الجديدة
    setUpdatedImage(null);

    // امسح Preview
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview("");

    // تنظيف input
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    // اقفل Edit
    setIsEditing(false);
  }

  // =========================
  // Update
  // =========================

  function handleUpdate() {
    // لو مفيش نص ولا صورة
    if (!updatedBody.trim() && !updatedImage) {
      toast.error("Please write something or choose an image");
      return;
    }

    toast.promise(
      updatePost({
        postId: _id,

        // لو فاضي مش هيتبعت للـ API
        body: updatedBody,

        // لو مفيش صورة مش هيتبعت
        file: updatedImage || undefined,
      }),
      {
        loading: "Updating post...",

        success: "Post updated successfully!",

        error: (err: any) =>
          err?.response?.data?.message ||
          err?.message ||
          "Failed to update post",
      },
    );
  }

  return (
    <div className="container mx-auto px-4">
      <Card className="w-full dark:bg-[#18181B] bg-gray-200">
        <Card.Header>
          {/* =========================
              User Info
          ========================= */}

          <Card.Title className="flex items-center gap-3 mb-3 pb-3 border-b-2 border-blue-900">
            <Avatar>
              <Avatar.Image alt={name} src={photo} />

              <Avatar.Fallback>JD</Avatar.Fallback>
            </Avatar>

            <div>
              <h2>{name}</h2>

              <p>
                {new Date(createdAt).toLocaleDateString().replace(/\//g, "-")}
              </p>
            </div>
          </Card.Title>

          {/* =========================
              Edit Button
          ========================= */}

          {isMyPost && !isEditing && (
            <button
              type="button"
              className="ml-auto dark:border-[#00ffe5] py-1 btn-178 my-3"
              onClick={handleEdit}
            >
              Edit Post
            </button>
          )}

          <div>
            {/* =========================
                Current Image
            ========================= */}

            {!isEditing && image && (
              <img className="w-full" src={image} alt={name} />
            )}

            {/* =========================
                Edit Mode
            ========================= */}

            {isEditing ? (
              <div className="flex flex-col gap-3">
                {/* =========================
                    Edit Text
                ========================= */}

                <input
                  value={updatedBody}
                  onChange={(e) => setUpdatedBody(e.target.value)}
                  className="w-full dark:text-amber-300 p-3 rounded border"
                  type="text"
                  placeholder="Update your post..."
                />

                {/* =========================
                    Image Upload
                ========================= */}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <DocumentUpload size="22" />
                    Change Image
                  </button>

                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </div>

                {/* =========================
                    New Image Preview
                ========================= */}

                {imagePreview && (
                  <div className="w-full">
                    <p className="mb-2 text-sm text-gray-500">New image:</p>

                    <img
                      src={imagePreview}
                      alt="New post preview"
                      className="w-full max-h-96 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* =========================
                    Current Image
                ========================= */}

                {!imagePreview && image && (
                  <div className="w-full">
                    <p className="mb-2 text-sm text-gray-500">Current image:</p>

                    <img
                      src={image}
                      alt={name}
                      className="w-full max-h-96 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* =========================
                    Buttons
                ========================= */}

                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="cursor-pointer group/button relative inline-flex items-center justify-center overflow-hidden rounded-md bg-blue-500/30 backdrop-blur-lg px-6 py-2 text-base font-semibold text-white transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl hover:shadow-blue-600/50 border border-white/20"
                  >
                    <span className="text-lg">Update</span>
                    <div className="absolute inset-0 flex h-full w-full justify-center transform-[skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:transform-[skew(-13deg)_translateX(100%)]">
                      <div className="relative h-full w-10 bg-white/30" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="relative border-2 cursor-pointer border-black group hover:border-green-500 w-12 h-12 duration-500 overflow-hidden"
                  >
                    <p className="font-Manrope text-3xl h-full w-full flex items-center justify-center text-black duration-500 relative z-10 group-hover:scale-0">
                      ×
                    </p>
                    <span className="absolute w-full h-full bg-green-500 rotate-45 group-hover:top-9 duration-500 top-12 left-0" />
                    <span className="absolute w-full h-full bg-green-500 rotate-45 top-0 group-hover:left-9 duration-500 left-12" />
                    <span className="absolute w-full h-full bg-green-500 rotate-45 top-0 group-hover:right-9 duration-500 right-12" />
                    <span className="absolute w-full h-full bg-green-500 rotate-45 group-hover:bottom-9 duration-500 bottom-12 right-0" />
                  </button>
                </div>
              </div>
            ) : (
              /* =========================
                  Post Body
              ========================= */

              <p className="italic text-zinc-900 dark:text-zinc-200 leading-loose wrap-break-word whitespace-normal overflow-wrap-break-word">
                {body}
              </p>
            )}
          </div>
        </Card.Header>
        {isMyPost && (
          <>
            {/* From Uiverse.io by Shubh0408 */}
            <button
              onClick={handleDelete}
              type="button"
              className="group cursor-pointer relative flex h-14 w-14 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-red-800 bg-red-400 hover:bg-red-600"
            >
              <svg
                viewBox="0 0 1.625 1.625"
                className="absolute -top-7 fill-white delay-100 group-hover:top-6 group-hover:animate-[spin_1.4s] group-hover:duration-1000"
                height={15}
                width={15}
              >
                <path d="M.471 1.024v-.52a.1.1 0 0 0-.098.098v.618c0 .054.044.098.098.098h.487a.1.1 0 0 0 .098-.099h-.39c-.107 0-.195 0-.195-.195" />
                <path d="M1.219.601h-.163A.1.1 0 0 1 .959.504V.341A.033.033 0 0 0 .926.309h-.26a.1.1 0 0 0-.098.098v.618c0 .054.044.098.098.098h.487a.1.1 0 0 0 .098-.099v-.39a.033.033 0 0 0-.032-.033" />
                <path d="m1.245.465-.15-.15a.02.02 0 0 0-.016-.006.023.023 0 0 0-.023.022v.108c0 .036.029.065.065.065h.107a.023.023 0 0 0 .023-.023.02.02 0 0 0-.007-.016" />
              </svg>
              <svg
                width={16}
                fill="none"
                viewBox="0 0 39 7"
                className="origin-right duration-500 group-hover:rotate-90"
              >
                <line strokeWidth={4} stroke="white" y2={5} x2={39} y1={5} />
                <line
                  strokeWidth={3}
                  stroke="white"
                  y2="1.5"
                  x2="26.0357"
                  y1="1.5"
                  x1={12}
                />
              </svg>
              <svg width={16} fill="none" viewBox="0 0 33 39">
                <mask fill="white" id="path-1-inside-1_8_19">
                  <path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z" />
                </mask>
                <path
                  mask="url(#path-1-inside-1_8_19)"
                  fill="white"
                  d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
                />
                <path strokeWidth={4} stroke="white" d="M12 6L12 29" />
                <path strokeWidth={4} stroke="white" d="M21 6V29" />
              </svg>
            </button>
          </>
        )}
        {/* =========================
            Footer
        ========================= */}
        <Card.Footer className="py3 mt-3 border-t border-violet-500">
          <div className="flex justify-between w-full my-3">
            <div className="flex gap-2.5">
              {/* زر اللايك */}
              {/* زر اللايك */}
              <button
                type="button"
                onClick={() => handleLike()}
                className="cursor-pointer hover:scale-110 transition-transform flex items-center gap-1.5"
              >
                <Like1
                  size={32}
                  color={isLikedByMe ? "#2dc442" : "#64748b"}
                  variant={isLikedByMe ? "Bold" : "Outline"} // 👈 هنا السر: Bold يجعلها Filled
                />

                {/* عرض عدد اللايكات بجانب الأيقونة */}
                <span
                  className={
                    isLikedByMe ? "text-[#2dc442] font-bold" : "text-slate-500"
                  }
                >
                  {post.likes?.length || 0}
                </span>
              </button>
              <Share size={40} color="#092" />
            </div>

            <div className="flex items-center gap-3 text-amber-400">
              {!PostDetails && (
                <Link
                  className="flex gap-3 items-center"
                  to={`/PostDetails/${_id}`}
                >
                  <span className="text-blue-800">{commentsCount}</span>
                  <MessageText size={40} color="#2dc442" />
                  show all coment
                </Link>
              )}
            </div>
          </div>
        </Card.Footer>
        {/* =========================
            Top Comment
        ========================= */}
        {topComment && !PostDetails && (
          <Coment comment={topComment} postId={post._id} />
        )}{" "}
      </Card>
    </div>
  );
}

import { Avatar, Card } from "@heroui/react";
import type { TopComment2 } from "../../pages/Post/Post.interface";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/CounterContext/AuthContext/AuthContext";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

interface UpdateCommentForm {
  content?: string;
  image?: FileList;
}

export default function Coment({
  comment,
  postId,
}: {
  comment: TopComment2;
  postId: string;
}) {
  const {
    commentCreator: { name, photo },
    createdAt,
    content,
    image,
  } = comment;

  const { userData } = useContext(AuthContext);

  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);

  // Check if this comment belongs to the logged-in user
  const isMyComment = comment.commentCreator._id === userData?._id;

  // =========================
  // DELETE COMMENT
  // =========================

  function deleteComment() {
    return axios.delete(
      `${import.meta.env.VITE_BASE_URL}/posts/${postId}/comments/${comment._id}`,
      {
        headers: {
          token: localStorage.getItem("tkn"),
        },
      },
    );
  }

  const { mutate: deleteCommentMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteComment,

    onSuccess: () => {
      toast.success("Comment deleted successfully");

      queryClient.invalidateQueries({
        queryKey: ["PostComments", postId],
      });

      queryClient.invalidateQueries({
        queryKey: ["PostDetails", postId],
      });
    },

    onError: () => {
      toast.error("Failed to delete comment");
    },
  });

  // =========================
  // UPDATE COMMENT
  // =========================

  function updateComment(data: UpdateCommentForm) {
    const formData = new FormData();

    // Get text
    const text = data.content?.trim();

    // Add content only if user entered text
    if (text) {
      formData.append("content", text);
    }

    // Add image only if user selected an image
    if (data.image && data.image.length > 0) {
      formData.append("image", data.image[0]);
    }

    return axios.put(
      `${import.meta.env.VITE_BASE_URL}/posts/${postId}/comments/${comment._id}`,
      formData,
      {
        headers: {
          token: localStorage.getItem("tkn"),
        },
      },
    );
  }

  const { mutate: updateCommentMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateComment,

    onSuccess: () => {
      toast.success("Comment updated successfully");

      setIsEditing(false);

      queryClient.invalidateQueries({
        queryKey: ["PostComments", postId],
      });

      queryClient.invalidateQueries({
        queryKey: ["PostDetails", postId],
      });
    },

    onError: () => {
      toast.error("Failed to update comment");
    },
  });

  // =========================
  // REACT HOOK FORM
  // =========================

  const { register, handleSubmit, reset } = useForm<UpdateCommentForm>({
    defaultValues: {
      content: comment.content,
    },
  });

  // =========================
  // SUBMIT UPDATE
  // =========================

  function onSubmit(data: UpdateCommentForm) {
    const hasText = !!data.content?.trim();

    const hasImage = data.image && data.image.length > 0;

    // Don't send request if there is no text and no image
    if (!hasText && !hasImage) {
      toast.error("Write something or choose an image");
      return;
    }

    updateCommentMutation(data);
  }

  // =========================
  // RENDER
  // =========================

  return (
    <Card className="w-full bg-amber-600/55 dark:bg-[#18181B]">
      <Card.Header>
        {/* =========================
            COMMENT HEADER
        ========================= */}

          <Link to={`/user-posts/${comment.commentCreator._id}`}>
        <Card.Title className="flex items-center gap-3 mb-3 pb-3 border-b-2 border-blue-900">
          <Avatar>
            <Avatar.Image alt={name} src={photo} />

            <Avatar.Fallback>{name?.charAt(0).toUpperCase()}</Avatar.Fallback>
          </Avatar>

          <div>
            <h2>{name}</h2>

            <p>
              {new Date(createdAt).toLocaleDateString().replace(/\//g, "-")}
            </p>
          </div>
        </Card.Title>
          </Link>

        {/* =========================
            COMMENT BODY
        ========================= */}

        <div>
          {/* Existing Image */}

          {image && (
            <img className="w-full rounded-lg mb-3" src={image} alt={name} />
          )}

          {/* =========================
              NORMAL VIEW
          ========================= */}

          {!isEditing && (
            <p className="wrap-break-word whitespace-normal text-black dark:text-white overflow-wrap-break-word">
              {content}
            </p>
          )}

          {/* =========================
              EDIT MODE
          ========================= */}

          {isEditing && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-3"
            >
              {/* Textarea */}

              <textarea
                {...register("content")}
                defaultValue={comment.content}
                placeholder="Write your comment..."
                className="w-full min-h-24 dark:text-amber-500  p-3 rounded-lg border border-gray-300  outline-none focus:border-blue-500"
              />

              {/* Image Upload */}

              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`comment-image-${comment._id}`}
                  className="cursor-pointer w-fit bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-5 rounded-full transition"
                >
                  Choose Image
                </label>

                <input
                  id={`comment-image-${comment._id}`}
                  type="file"
                  accept="image/*"
                  {...register("image")}
                  className="hidden "
                />
              </div>

              {/* Buttons */}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="cursor-pointer bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-2 px-5 rounded-full transition"
                >
                  {isUpdating ? "Updating..." : "Save"}
                </button>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => {
                    setIsEditing(false);

                    reset({
                      content: comment.content,
                    });
                  }}
                  className="cursor-pointer bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white font-bold py-2 px-5 rounded-full transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </Card.Header>

      {/* =========================
          FOOTER
      ========================= */}

      <Card.Footer className="flex gap-3 py-3 mt-3 border-t border-violet-500">
        {isMyComment && !isEditing && (
          <>
            {/* EDIT */}

            <button
              onClick={() => {
                setIsEditing(true);

                reset({
                  content: comment.content,
                });
              }}
              className="cursor-pointer bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
            >
              Edit
            </button>

            {/* DELETE */}

            <button
              onClick={() => {
                const confirmed = window.confirm(
                  "Are you sure you want to delete this comment?",
                );

                if (confirmed) {
                  deleteCommentMutation();
                }
              }}
              disabled={isDeleting}
              className="cursor-pointer bg-red-400 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </>
        )}
      </Card.Footer>
    </Card>
  );
}

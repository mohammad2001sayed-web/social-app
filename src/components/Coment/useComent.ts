import { useState, useEffect, useRef, useContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { deleteCommentApi, updateCommentApi } from "./coment.api";
import { AuthContext } from "../../context/CounterContext/AuthContext/AuthContext";
import type { TopComment2 } from "../../pages/Post/Post.interface";

interface UpdateCommentForm {
  content?: string;
  image?: FileList;
}

export function useComent(comment: TopComment2, postId: string) {
  const { userData } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // حالات الردود والإعجاب الجديدة
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [repliesList, setRepliesList] = useState<any[]>([]);
  const [isLikedByMe, setIsLikedByMe] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const menuRef = useRef<HTMLDivElement>(null);

  const userId = userData?._id || userData?.id;
  const isMyComment = comment.commentCreator._id === userId;

  // إغلاق المنيو عند الضغط خارجها
  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  // Delete Mutation
  const { mutate: deleteCommentMutation, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteCommentApi({ postId, commentId: comment._id }),
    onSuccess: () => {
      toast.success("Comment deleted successfully");
      setConfirmDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["PostComments", postId] });
      queryClient.invalidateQueries({ queryKey: ["PostDetails", postId] });
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });

  // Update Mutation
  const { mutate: updateCommentMutation, isPending: isUpdating } = useMutation({
    mutationFn: (formData: FormData) =>
      updateCommentApi({ postId, commentId: comment._id, formData }),
    onSuccess: () => {
      toast.success("Comment updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["PostComments", postId] });
      queryClient.invalidateQueries({ queryKey: ["PostDetails", postId] });
    },
    onError: () => {
      toast.error("Failed to update comment");
    },
  });

  const { register, handleSubmit, reset } = useForm<UpdateCommentForm>({
    defaultValues: {
      content: comment.content,
    },
  });

  function onSubmit(data: UpdateCommentForm) {
    const hasText = !!data.content?.trim();
    const hasImage = data.image && data.image.length > 0;

    if (!hasText && !hasImage) {
      toast.error("Write something or choose an image");
      return;
    }

    const formData = new FormData();
    if (hasText) formData.append("content", data.content!.trim());
    if (hasImage) formData.append("image", data.image![0]);

    updateCommentMutation(formData);
  }

  // دوال الإعجاب والردود المؤقتة للواجهة
  function handleLikeComment() {
    setIsLikedByMe((prev) => !prev);
    setLikesCount((prev) => (isLikedByMe ? prev - 1 : prev + 1));
  }

  function handleSendReply() {
    if (!replyText.trim()) return;

    const newReply = {
      content: replyText,
      user: {
        name: userData?.name || "You",
        photo: userData?.photo || "",
      },
    };

    setRepliesList((prev) => [...prev, newReply]);
    setReplyText("");
    setShowReplyInput(false);
    toast.success("Reply added!");
  }

  const formattedDate = new Date(comment.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  return {
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
    replyText,
    setReplyText,
    handleLikeComment,
    handleSendReply,
    isLikedByMe,
    likesCount,
    repliesList,
  };
}
import { useState, useEffect, useRef, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  deleteCommentApi,
  updateCommentApi,
  toggleCommentLikeApi,
  addCommentReplyApi,
  getCommentRepliesApi,
} from "./coment.api";
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

  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);

  const userId = userData?._id || userData?.id;
  const isMyComment = comment.commentCreator._id === userId;

  const isLikedByMe = comment.likes?.some(
    (item: any) =>
      (typeof item === "string" ? item : item?._id || item?.id) === userId,
  );
  const likesCount = comment.likes?.length || 0;

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

  // =========================
  // Replies
  // =========================
  const embeddedReplies: any[] = (comment as any).replies || [];
  const repliesCount: number =
    (comment as any).repliesCount ?? embeddedReplies.length;

  // لو الردود جاية جوه الكومنت نفسه منحتاجش نطلبها تاني
  const { data: fetchedReplies = [], isLoading: isLoadingReplies } = useQuery({
    queryKey: ["CommentReplies", comment._id],
    queryFn: async () => {
      const res = await getCommentRepliesApi({
        postId,
        commentId: comment._id,
      });
      const d = res.data;
      // بنقبل أكتر من شكل للـ response
      return (
        d?.data?.replies ??
        d?.replies ??
        d?.data?.comments ??
        d?.comments ??
        []
      ) as any[];
    },
    enabled: showReplies && embeddedReplies.length === 0,
  });

  const repliesList: any[] = showReplies
    ? embeddedReplies.length > 0
      ? embeddedReplies
      : fetchedReplies
    : [];

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["PostComments", postId] });
    queryClient.invalidateQueries({ queryKey: ["PostDetails", postId] });
    queryClient.invalidateQueries({ queryKey: ["CommentReplies", comment._id] });
  }

  // =========================
  // Mutations
  // =========================
  const { mutate: deleteCommentMutation, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteCommentApi({ postId, commentId: comment._id }),
    onSuccess: () => {
      toast.success("Comment deleted successfully");
      setConfirmDeleteOpen(false);
      invalidateAll();
    },
    onError: () => toast.error("Failed to delete comment"),
  });

  const { mutate: updateCommentMutation, isPending: isUpdating } = useMutation({
    mutationFn: (formData: FormData) =>
      updateCommentApi({ postId, commentId: comment._id, formData }),
    onSuccess: () => {
      toast.success("Comment updated successfully");
      setIsEditing(false);
      invalidateAll();
    },
    onError: () => toast.error("Failed to update comment"),
  });

  const { mutate: handleLikeComment } = useMutation({
    mutationFn: () => toggleCommentLikeApi({ postId, commentId: comment._id }),
    onSuccess: () => invalidateAll(),
    onError: () => toast.error("Failed to like comment"),
  });

  const { mutate: sendReplyMutation, isPending: isSendingReply } = useMutation({
    mutationFn: (content: string) =>
      addCommentReplyApi({ postId, commentId: comment._id, content }),
    onSuccess: () => {
      toast.success("Reply added successfully!");
      setReplyText("");
      setShowReplyInput(false);
      setShowReplies(true); // اعرض الردود بعد الإرسال
      invalidateAll();
    },
    onError: () => toast.error("Failed to add reply"),
  });

  // =========================
  // Edit form
  // =========================
  const { register, handleSubmit, reset } = useForm<UpdateCommentForm>({
    defaultValues: { content: comment.content },
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

  function handleSendReply() {
    if (!replyText.trim()) return;
    sendReplyMutation(replyText.trim());
  }

  const formattedDate = new Date(comment.createdAt).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short" },
  );

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
  };
}
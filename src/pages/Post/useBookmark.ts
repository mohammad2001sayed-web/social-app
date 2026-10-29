import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { toggleBookmarkPost } from "./Post.api"; // عدل المسار حسب مكان ملف الـ API عندك

export function useBookmark(postId: string, initialBookmarkState = false) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarkState);
  const queryClient = useQueryClient();

  const { mutate: handleBookmark, isPending: isBookmarking } = useMutation({
    mutationFn: () => toggleBookmarkPost(postId),
    onSuccess: () => {
      setIsBookmarked((prev) => !prev);
      toast.success(
        !isBookmarked ? "Post saved successfully!" : "Post removed from saves",
      );
      queryClient.invalidateQueries({ queryKey: ["allPost"] });
      queryClient.invalidateQueries({ queryKey: ["savedPosts"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to save post");
    },
  });

  return { isBookmarked, handleBookmark, isBookmarking };
}
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useRef, useState } from "react";
import { Avatar } from "@heroui/react";
import { Gallery, Send2, CloseCircle } from "iconsax-react";
import { AuthContext } from "../../../context/CounterContext/AuthContext/AuthContext";

export default function CreateComment({ postId }: { postId: string }) {
  const { userData } = useContext(AuthContext);

  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // تنظيف الـ preview من الذاكرة
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function createComment() {
    const formData = new FormData();
    if (content.trim()) formData.append("content", content.trim());
    if (image) formData.append("image", image);

    return axios.post(
      `${import.meta.env.VITE_BASE_URL}/posts/${postId}/comments`,
      formData,
      { headers: { token: localStorage.getItem("tkn") } },
    );
  }

  const { mutate, isPending } = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      setContent("");
      removeImage();
      queryClient.invalidateQueries({ queryKey: ["PostComments", postId] });
      queryClient.invalidateQueries({ queryKey: ["PostDetails", postId] });
    },
  });

  const canSend = !isPending && (content.trim() !== "" || image !== null);

  function handleSubmit() {
    if (!canSend) return;
    mutate();
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImage(null);
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="w-full">
      {/* معاينة الصورة */}
      {preview && (
        <div className="relative mb-3 ms-12 inline-block">
          <img
            src={preview}
            alt="comment preview"
            className="h-24 w-24 rounded-xl object-cover border border-gray-200 dark:border-slate-700"
          />
          <button
            type="button"
            onClick={removeImage}
            aria-label="Remove image"
            className="absolute -top-2 -right-2 rounded-full bg-white dark:bg-slate-900 cursor-pointer hover:scale-110 transition-transform"
          >
            <CloseCircle size="22" variant="Bold" color="#ef4444" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <Avatar size="sm" className="shrink-0 mb-1">
          <Avatar.Image alt={userData?.name || "User"} src={userData?.photo} />
          <Avatar.Fallback>
            {userData?.name ? userData.name.substring(0, 2).toUpperCase() : "U"}
          </Avatar.Fallback>
        </Avatar>

        {/* الحقل الدائري */}
        <div className="flex flex-1 items-end gap-1 rounded-3xl bg-gray-100 dark:bg-slate-800 px-4 py-1.5 transition-shadow focus-within:ring-2 focus-within:ring-indigo-500/50">
          <textarea
            value={content}
            rows={1}
            onChange={(e) => {
              setContent(e.target.value);
              // يكبر مع الكتابة لحد 120px
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => {
              // Enter = إرسال، Shift+Enter = سطر جديد
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Write a comment..."
            className="flex-1 resize-none bg-transparent py-1.5 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 outline-none"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Add photo"
            className="mb-1 cursor-pointer rounded-full p-1 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Gallery size="22" color="#FF8A65" />
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSend}
            aria-label="Send comment"
            className="mb-1 rounded-full p-1 transition-all enabled:cursor-pointer enabled:hover:bg-indigo-500/10 disabled:opacity-30"
          >
            <Send2
              size="22"
              variant="Bold"
              color={canSend ? "#6366f1" : "#9ca3af"}
              className={isPending ? "animate-pulse" : ""}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
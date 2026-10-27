  import axios from "axios";
  import { useMutation, useQueryClient } from "@tanstack/react-query";
  import { useRef, useState } from "react";
  import { Button, Input } from "@heroui/react";

  export default function CreateComment({ postId }: { postId: string }) {
    const [content, setContent] = useState("");
    const [image, setImage] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const queryClient = useQueryClient();

    async function createComment() {
      const formData = new FormData();

      if (content.trim()) {
        formData.append("content", content.trim());
      }

      if (image) {
        formData.append("image", image);
      }

      return axios.post(
        `${import.meta.env.VITE_BASE_URL}/posts/${postId}/comments`,
        formData,
        {
          headers: {
            token: localStorage.getItem("tkn"),
          },
        }
      );
    }

    const { mutate, isPending } = useMutation({
      mutationFn: createComment,

      onSuccess: () => {
        setContent("");
        setImage(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        queryClient.invalidateQueries({
          queryKey: ["PostComments", postId],
        });

        queryClient.invalidateQueries({
          queryKey: ["PostDetails", postId],
        });
      },
    });

    function handleSubmit() {
      if (!content.trim() && !image) return;

      mutate();
    }

    return (
      <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-[#18181B] border-t p-4">
        <div className="w-9/12 mx-auto flex gap-3 items-center">

          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];

              if (selectedFile) {
                setImage(selectedFile);
              }
            }}
          />

          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            📷
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            isDisabled={isPending || (!content.trim() && !image)}
          >
            {isPending ? "Sending..." : "Send"}
          </Button>

        </div>

        {image && (
          <p className="w-9/12 mx-auto mt-2 text-sm text-green-600">
            {image.name}
          </p>
        )}
      </div>
    );
  }
import { Avatar, Modal } from "@heroui/react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Post } from "../../Post.interface";
import { sharePostApi } from "../../Post.api";

export default function SharePostModal({
  post,
  isOpen,
  onOpenChange,
}: {
  post: Post;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");

  const {
    user: { name, photo },
    body,
    image,
    createdAt,
  } = post;

  const { mutate: sharePost, isPending } = useMutation({
    mutationFn: () =>
      sharePostApi({ postId: post._id, body: { body: text.trim() } }),
    onSuccess: () => {
      toast.success("Post shared to your profile");
      setText("");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["allPost"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to share post",
      );
    },
  });

  function handleOpenChange(open: boolean) {
    // ماتقفلش المودال أثناء الإرسال
    if (isPending && !open) return;
    if (!open) setText("");
    onOpenChange(open);
  }

  const date = new Date(createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      variant="blur"
      isDismissable={!isPending}
    >
      <Modal.Container size="md">
        <Modal.Dialog>
          <Modal.CloseTrigger />

          <Modal.Header>
            <Modal.Heading>Share post</Modal.Heading>
          </Modal.Header>

          <Modal.Body>
            <div className="flex flex-col gap-4 p-1">
              {/* كلمة منك على الشير */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                autoFocus
                placeholder="Say something about this post..."
                className="w-full resize-none rounded-xl border border-gray-300 bg-transparent p-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted focus:ring-2 focus:ring-indigo-500/50 dark:border-slate-600"
              />

              {/* معاينة البوست الأصلي */}
              <div className="overflow-hidden rounded-xl border border-gray-300 dark:border-slate-600">
                <div className="flex items-center gap-3 px-3 pt-3">
                  <Avatar size="sm">
                    <Avatar.Image alt={name} src={photo} />
                    <Avatar.Fallback>
                      {name ? name.substring(0, 2).toUpperCase() : "U"}
                    </Avatar.Fallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {name}
                    </p>
                    <p className="text-xs text-muted">{date}</p>
                  </div>
                </div>

                {body && (
                  <p className="line-clamp-3 whitespace-pre-wrap wrap-break-word px-3 pt-2 text-sm text-foreground">
                    {body}
                  </p>
                )}

                {image && (
                  <img
                    src={image}
                    alt={`${name}'s post`}
                    loading="lazy"
                    className="mt-2 max-h-48 w-full object-cover"
                  />
                )}

                {!image && <div className="h-3" />}
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <div className="flex w-full items-center justify-end gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleOpenChange(false)}
                className="cursor-pointer rounded-xl bg-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-300 disabled:opacity-50 dark:bg-slate-700 dark:text-gray-100 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => sharePost()}
                className="cursor-pointer rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {isPending ? "Sharing..." : "Share now"}
              </button>
            </div>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
import { Avatar, Form, TextArea } from "@heroui/react";
import type { User } from "../../Login/login.interface";
import { DocumentUpload, CloseCircle } from "iconsax-react";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FnCreatPost } from "../CreatPost.abi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function CreatePost({ user }: { user: User }) {
  const { name, photo } = user;

  const queryClient = useQueryClient();
  const upfile = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      body: "",
    },
  });

  const [postImage, setPostImage] = useState<File | null>(null);
  const [upUserImage, setUpUserImage] = useState<string>("");

  const { mutateAsync, isPending } = useMutation({
    mutationFn: FnCreatPost,
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ["allPost"],
        type: "active",
      });
    },
  });

  function CreateUserPost(data: { body: string }) {
    if (!data.body.trim() && !postImage) {
      toast.error("Please write something or choose an image");
      return;
    }

    const formData = new FormData();
    if (data.body.trim()) {
      formData.append("body", data.body.trim());
    }
    if (postImage) {
      formData.append("image", postImage);
    }

    toast.promise(mutateAsync(formData), {
      loading: "Creating post...",
      success: (res) => {
        reset();
        setPostImage(null);
        setUpUserImage("");
        if (upfile.current) {
          upfile.current.value = "";
        }
        return <span className="text-emerald-600">{res || "Post created successfully!"}</span>;
      },
      error: (err: any) =>
        err?.response?.data?.message || err?.message || "Failed to create post",
    });
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (upUserImage) {
      URL.revokeObjectURL(upUserImage);
    }

    setPostImage(file);
    const previewUrl = URL.createObjectURL(file);
    setUpUserImage(previewUrl);
  }

  function removeImage() {
    if (upUserImage) URL.revokeObjectURL(upUserImage);
    setPostImage(null);
    setUpUserImage("");
    if (upfile.current) upfile.current.value = "";
  }

  return (
    <div className="w-full">
      {/* كارد بتصميم عصري نظيف وداعم للـ Dark/Light mode */}
      <div className="w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
        
        {/* رأس الكارد: رحب بالمستخدم بشكل أنيق */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-slate-800">
          <Avatar className="h-9 w-9">
            <Avatar.Image alt={name} src={photo} />
            <Avatar.Fallback>{name?.charAt(0).toUpperCase()}</Avatar.Fallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Create Post
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              What is on your mind, {name}?
            </p>
          </div>
        </div>

        <Form onSubmit={handleSubmit(CreateUserPost)}>
          <div className="flex flex-col gap-3">
            {/* حقل الكتابة بتصميم مريح */}
            <TextArea
              {...register("body")}
              className="w-full resize-none bg-transparent placeholder:text-gray-400 text-gray-800 dark:text-gray-200 text-sm focus:outline-none border-2 border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5"
              rows={3}
              placeholder="Share your thoughts or update..."
            />

            {/* معاينة الصورة المرفوعة مع زر حذف سريع */}
            {upUserImage && (
              <div className="relative mt-2 inline-block overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 max-w-xs">
                <img
                  className="max-h-52 w-full object-cover"
                  src={upUserImage}
                  alt="post preview"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                >
                  <CloseCircle size="20" />
                </button>
              </div>
            )}
          </div>

          {/* شريط الأدوات السفلي: رفع الصور وزر النشر */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-slate-800">
            {/* زر رفع الصورة */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => upfile.current?.click()}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <DocumentUpload size="20" color="#f97316" />
                <span>Photo/Video</span>
              </button>
              <input
                ref={upfile}
                onChange={handleImageChange}
                type="file"
                accept="image/*"
                hidden
              />
            </div>

            {/* زر النشر بتصميم متوازن */}
            <button
              type="submit"
              disabled={isPending}
              className="cursor-pointer rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {isPending ? "Posting..." : "Post"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
import { Avatar, Form, TextArea } from "@heroui/react";
import type { User } from "../../Login/login.interface";
import { DocumentUpload } from "iconsax-react";
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

  const { mutateAsync } = useMutation({
    mutationFn: FnCreatPost,

    onSuccess: async () => {
      // تحديث البوستات بعد إنشاء بوست جديد
      await queryClient.refetchQueries({
        queryKey: ["allPost"],
        type: "active",
      });
    },
  });

  function CreateUserPost(data: { body: string }) {
    // منع إرسال بوست فاضي تمامًا
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
        // تنظيف الفورم
        reset();

        // تنظيف الصورة
        setPostImage(null);
        setUpUserImage("");

        // تنظيف input file
        if (upfile.current) {
          upfile.current.value = "";
        }

        return (
          <span className="text-green-700">
            {res || "Post created successfully!"}
          </span>
        );
      },

      error: (err: any) =>
        err?.response?.data?.message || err?.message || "Failed to create post",
    });
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    // لو فيه Preview قديم امسحه
    if (upUserImage) {
      URL.revokeObjectURL(upUserImage);
    }

    setPostImage(file);

    const previewUrl = URL.createObjectURL(file);
    setUpUserImage(previewUrl);
  }

  return (
    <div className="w-full">
      <div className="w-full bg-[#000d0d]/20 p-3 rounded-lg">
        <div className="flex items-center gap-3 mb-3 pb-3 border-b-2 border-blue-900">
          <h2 className="text-amber-700 font-medium">
            Hello {name}, what is on your mind?
          </h2>
        </div>
        <Form onSubmit={handleSubmit(CreateUserPost)}>
          <div className="flex flex-row items-center gap-3 mb-3">
            <Avatar>
              <Avatar.Image alt={name} src={photo} />
            <Avatar.Fallback>{name.charAt(0).toUpperCase()}</Avatar.Fallback>
            </Avatar>

            <TextArea
              {...register("body")}
              className="grow resize-none placeholder:text-gray-500 placeholder:dark:text-gray-400 text-[16px]"
              rows={3}
              placeholder="Create Your Post..."
            />

            <DocumentUpload
              onClick={() => upfile.current?.click()}
              size="32"
              color="#FF8A65"
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />

            {/* 👇 جواه هنا أحسن */}
            <input
              ref={upfile}
              onChange={handleImageChange}
              type="file"
              accept="image/*"
              hidden
            />
          </div>

          {upUserImage && (
            <div className="mb-3 relative">
              <img
                className="w-1/4 mx-auto rounded-2xl max-h-48 object-cover"
                src={upUserImage}
                alt="post preview"
              />
            </div>
          )}

          <div className="flex justify-center py-3">
            <button
              type="submit"
              className="cursor-pointer w-100 relative px-8 py-3 bg-black text-white font-semibold rounded-lg border-2 border-purple-500 hover:border-purple-400 transition-all duration-300 hover:shadow-[0_0_20px_10px_rgba(168,85,247,0.6)] active:scale-95 active:shadow-[0_0_10px_5px_rgba(168,85,247,0.4)] group"
            >
              <span className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                  className="w-6 h-6 text-purple-500 group-hover:text-white transition-colors duration-300"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Create Post</span>
              </span>
              <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-r from-purple-500/20 to-indigo-500/20" />
            </button>
          </div>
        </Form>{" "}
      </div>
    </div>
  );
}

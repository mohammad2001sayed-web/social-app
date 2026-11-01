import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, Button } from "@heroui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import toast from "react-hot-toast";
import { Link } from "react-router";
import { CloseCircle } from "iconsax-react";
import { getSuggestedUsersApi, followUserApi } from "../Post.api"; // عدل المسار حسب مكان ملف الـ API

const MAX_VISIBLE = 6;

export default function SuggestedUsers() {
  const queryClient = useQueryClient();

  // الناس اللي اتشالت (X أو Follow)، ومكانهم بيتاخد بالتالي
  const [removed, setRemoved] = useState<string[]>([]);

  // بنجيب أكتر من 6 عشان لما واحد يتشال يجي اللي بعده
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: () => getSuggestedUsersApi(12),
  });

  const visible = users
    .filter((u: any) => !removed.includes(u._id))
    .slice(0, MAX_VISIBLE);

  const { mutate: handleFollow, isPending, variables } = useMutation({
    mutationFn: (userId: string) => followUserApi(userId),
    onSuccess: (_data, userId) => {
      toast.success("Started following user!");
      setRemoved((prev) => [...prev, userId]); // يختفي ويجي اللي بعده
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["allPost"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to follow user");
    },
  });

  function dismiss(userId: string) {
    setRemoved((prev) => [...prev, userId]);
  }

  // مكان محجوز أثناء التحميل عشان البوستات ماتتزقش لتحت
  if (isLoading) {
    return (
      <div className="h-64 animate-pulse rounded-2xl bg-gray-100 dark:bg-slate-800" />
    );
  }
  if (visible.length === 0) return null;

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#18181B]">
      <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-gray-100">
        People you may know
      </h3>

      <Swiper
        slidesPerView="auto"
        spaceBetween={12}
        grabCursor
        className="w-full"
      >
        {visible.map((user: any) => (
          <SwiperSlide key={user._id} className="w-40!">
            <div className="relative flex flex-col items-center gap-2 rounded-2xl border border-gray-200 p-4 pt-6 dark:border-slate-700">
              {/* X: يشيل الشخص ده */}
              <button
                type="button"
                onClick={() => dismiss(user._id)}
                aria-label={`Remove ${user.name}`}
                className="absolute right-2 top-2 cursor-pointer rounded-full text-gray-400 transition-colors hover:text-red-500"
              >
                <CloseCircle size="22" color="currentColor" variant="Bold" />
              </button>

              <Link
                to={`/user-posts/${user._id}`}
                className="flex min-w-0 flex-col items-center gap-2"
              >
                <Avatar className="h-16 w-16">
                  <Avatar.Image src={user.photo} alt={user.name} />
                  <Avatar.Fallback>
                    {user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                  </Avatar.Fallback>
                </Avatar>

                <div className="w-full min-w-0 text-center">
                  <p className="truncate text-sm font-semibold text-gray-900 hover:underline dark:text-gray-100">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {user.username ? `@${user.username}` : ""}
                  </p>
                </div>
              </Link>

              <Button
                size="sm"
                variant="primary"
                className="w-full text-xs font-semibold"
                isDisabled={isPending && variables === user._id}
                onPress={() => handleFollow(user._id)}
              >
                Follow
              </Button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
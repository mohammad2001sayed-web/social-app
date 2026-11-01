import { useContext } from "react";
import { HandleAllPost } from "./Post.api";
import Loding from "../../components/Loding/Loding";
import { AuthContext } from "../../context/CounterContext/AuthContext/AuthContext";
import { useQuery } from "@tanstack/react-query";
import CreatePost from "./CreatePost/CreatePost";
import type { Post as PostType } from "./Post.interface";
import PostsFeed from "../PostsFeed/PostsFeed";

export default function Post() {
  const { userData } = useContext(AuthContext);

  const {
    isLoading,
    isError,
    error,
  } = useQuery<PostType[]>({
    queryKey: ["allPost"],
    queryFn: HandleAllPost,

    // مهم:
    // شيلنا reverse عشان الـ API غالبًا بيرجع الأحدث أولًا
    select: (data) => data,
  });

  if (isLoading) {
    return <Loding />;
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-3xl text-red-500 font-bold">
          {error instanceof Error
            ? error.message
            : "حدث خطأ أثناء جلب البيانات"}
        </h1>
      </div>
    );
  }

  return (
    <div className="dark:bg-slate-900 bg-[#0b957a] min-h-screen">
<div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-4 px-4 pt-4 md:px-0">        {/* Create Post */}
        {userData && <CreatePost user={userData} />}

       {/* الفيد مع الـ infinite scroll */}
        <PostsFeed />
      </div>
    </div>
  );
}

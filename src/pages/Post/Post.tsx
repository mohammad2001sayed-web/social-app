import { useContext } from "react";
import { HandleAllPost } from "./Post.api";
import Loding from "../../components/Loding/Loding";
import PostCard from "./PostCard/PostCard";
import { AuthContext } from "../../context/CounterContext/AuthContext/AuthContext";
import { useQuery } from "@tanstack/react-query";
import CreatePost from "./CreatePost/CreatePost";
import type { Post as PostType } from "./Post.interface";

export default function Post() {
  const { userData } = useContext(AuthContext);

  const {
    data: posts = [],
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
      <div className="md:pt-20 lg:w-6/12 mx-auto flex flex-col gap-3 justify-center items-center pb-10">
        {/* Create Post */}
        {userData && <CreatePost user={userData} />}

        {/* Posts */}
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post._id || post.id} post={post} />
          ))
        ) : (
          <p className="text-white text-lg">لا توجد منشورات حتى الآن الرجاء اعادة تسجيل الدخول مرة اخرى </p>
        )}
      </div>
    </div>
  );
}

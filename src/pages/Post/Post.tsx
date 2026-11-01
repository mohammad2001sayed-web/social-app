import { useContext } from "react";
import { AuthContext } from "../../context/CounterContext/AuthContext/AuthContext";
import CreatePost from "./CreatePost/CreatePost";
import PostsFeed from "../PostsFeed/PostsFeed";

export default function Post() {
  const { userData } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-[#0b957a] dark:bg-slate-900">
      <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-4 px-4 pt-5 md:mt-10 md:px-0">
        {/* Create Post */}
        {userData ? (
  <CreatePost user={userData} />
) : (
  <div className="h-56 animate-pulse rounded-lg bg-[#000d0d]/20" />
)}

        {/* الفيد مع الـ infinite scroll (هو اللي بيعرض loading والأخطاء) */}
        <PostsFeed />
      </div>
    </div>
  );
}
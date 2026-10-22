import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import PostCard from "../Post/PostCard/PostCard";
import { Card, Avatar } from "@heroui/react";
import { getUserPosts } from "./user.api";
import Loding from "../../components/Loding/Loding";

export default function UserPosts() {
  // أخذ id المستخدم من رابط الصفحة: /user-posts/:id
  const { id } = useParams<{ id: string }>();

  const {
    data: posts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userPosts", id],
    queryFn: () => getUserPosts(id!),
    enabled: !!id, // لا يرسل الطلب إلا بعد التأكد من وجود الـ id
  });

  if (isLoading) return <Loding />;

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl text-red-500 font-bold">
          {error instanceof Error ? error.message : "حدث خطأ أثناء جلب المنشورات"}
        </h1>
      </div>
    );
  }

  // استخراج بيانات صاحب الحساب من أول منشور (إن وجد)
  const user = posts && posts.length > 0 ? posts[0].user : null;

  return (
    <div className="dark:bg-slate-900 bg-[#0b957a] min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-5">
        
        {/* كارت البروفايل ومعلومات المستخدم */}
        {user && (
          <Card className="p-6 bg-white dark:bg-[#18181B] rounded-2xl shadow-md flex flex-row items-center gap-4">
            <Avatar className="w-20 h-20">
              <Avatar.Image src={user.photo} alt={user.name} />
              <Avatar.Fallback>{user.name?.[0]}</Avatar.Fallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold dark:text-white text-gray-800">
                {user.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                عدد المنشورات: <span className="font-semibold">{posts?.length || 0}</span>
              </p>
            </div>
          </Card>
        )}

        {/* عرض المنشورات */}
        {posts && posts.length > 0 ? (
          posts.map((post: any) => (
            <PostCard key={post._id} post={post}  />
          ))
        ) : (
          <div className="bg-white dark:bg-[#18181B] p-8 text-center rounded-2xl">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              لا توجد منشورات لهذا المستخدم حتى الآن.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
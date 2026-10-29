import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import CreateComment from "../PostDetails/CreateComment/CreateComment";
import type {
  PostDetailsRisponse,
  CommentsResponse,
} from "./PostDetails.interface";

import Loding from "../../components/Loding/Loding";
import PostCard from "../Post/PostCard/PostCard";
import Coment from "../../components/Coment/Coment";

export default function PostDetails() {
  const { id } = useParams<{ id: string }>();

  // =========================
  // Get Single Post
  // =========================
  function getSinglePost() {
    return axios.get<PostDetailsRisponse>(
      `${import.meta.env.VITE_BASE_URL}/posts/${id}`,
      {
        headers: {
          token: localStorage.getItem("tkn"),
        },
      },
    );
  }

  // =========================
  // Get All Comments
  // =========================
  function getComments() {
    return axios.get<CommentsResponse>(
      `${import.meta.env.VITE_BASE_URL}/posts/${id}/comments?page=1&limit=10`,
      {
        headers: {
          token: localStorage.getItem("tkn"),
        },
      },
    );
  }

  // =========================
  // Post Query
  // =========================
  const {
    data: postData,
    isLoading: postLoading,
    isError: postError,
    error: postErrorMessage,
  } = useQuery({
    queryKey: ["PostDetails", id],
    queryFn: getSinglePost,
    select: (data) => data.data.data.post,
    enabled: !!id,
  });

  // =========================
  // Comments Query
  // =========================
  const {
    data: commentsData,
    isLoading: commentsLoading,
    isError: commentsError,
    error: commentsErrorMessage,
  } = useQuery({
    queryKey: ["PostComments", id],
    queryFn: getComments,
    select: (data) => data.data.data.comments,
    enabled: !!id,
  });

  // =========================
  // Loading
  // =========================
  if (postLoading || commentsLoading) {
    return <Loding />;
  }

  // =========================
  // Post Error
  // =========================
  if (postError) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <h1 className="text-2xl text-red-500 font-semibold bg-red-100 dark:bg-red-950/40 p-4 rounded-xl">
          {postErrorMessage.message}
        </h1>
      </div>
    );
  }

  // =========================
  // Comments Error
  // =========================
  if (commentsError) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <h1 className="text-2xl text-red-500 font-semibold bg-red-100 dark:bg-red-950/40 p-4 rounded-xl">
          {commentsErrorMessage.message}
        </h1>
      </div>
    );
  }

  // =========================
  // UI (Split View: Post on Left/Right, Comments on the other side)
  // =========================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 md:px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* زر العودة */}
        <div className="my-16">
          <button
            onClick={() => window.history.back()}
            className="px-4 cursor-pointer py-2 text-sm font-medium bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-slate-800 transition-all text-gray-700 dark:text-gray-200"
          >
            ← Back to previous page
          </button>
        </div>

        {/* شبكة التقسيم (Grid Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* الجانب الأيمن / الأيسر: البوست الأساسي (يأخذ مساحة أكبر مثلاً 7 أعمدة) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            {postData && <PostCard post={postData} PostDetails />}
          </div>

          {/* الجانب الآخر: قسم التعليقات (يأخذ 5 أعمدة مع إمكانية التمرير الداخلي) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5 flex flex-col h-[calc(100vh-140px)] sticky top-6">
            
            {/* رأس قسم التعليقات */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                Comments ({commentsData?.length || 0})
              </h2>
            </div>

            {/* قائمة التعليقات (مع Scroll داخلي عشان لو التعليقات كتيرة) */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {commentsData && commentsData.length > 0 ? (
                commentsData.map((comment) => (
                  <div 
                    key={comment._id} 
                    className="p-3 rounded-xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 transition-all"
                  >
                    <Coment comment={comment} postId={id!} />
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              )}
            </div>

            {/* صندوق كتابة تعليق جديد مثبت في أسفل قسم الكومنتات */}
            <div className="pt-4 mt-3 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CreateComment postId={id!} />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
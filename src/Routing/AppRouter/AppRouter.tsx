import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import Layout from "../../pages/Layout/Layout";
import Post from "../../pages/Post/Post";
import Login from "../../pages/Login/Login";
import Register from "../../pages/Register/Register";
import NotFound from "../../pages/NotFound/NotFound";
import ProtectedRoute from "../../components/ProtectedRouter/ProtectedRoute";
import AuthProtectedRoute from "../../components/AuthProtectedRoute/AuthProtectedRoute";
import Loding from "../../components/Loding/Loding";

// الصفحات دي بتتحمّل لما تحتاجها بس، مش مع أول صفحة
const PostDetails = lazy(() => import("../../pages/PostDetails/PostDetails"));
const Profile = lazy(() => import("../../components/Profile/Profile"));
const EditProfile = lazy(
  () => import("../../components/Profile/EditProfile/EditProfile"),
);
const UserPosts = lazy(() => import("../../pages/UserPosts/UserPosts"));
const Notifications = lazy(
  () => import("../../pages/Notifications/Notifications"),
);
// ⚠️ عدّل المسار ده حسب مكان الملف عندك
const SuggestedUsersPage = lazy(
  () => import("../../pages/Post/SuggestedUsers/SuggestedUsersPage"),   // ← صح
);
// بيغلّف الصفحة بـ Suspense عشان تظهر شاشة التحميل أثناء تحميل الـ chunk
const page = (element: ReactNode) => (
  <ProtectedRoute>
    <Suspense fallback={<Loding />}>{element}</Suspense>
  </ProtectedRoute>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/post" replace /> },

      { path: "post", element: <ProtectedRoute><Post /></ProtectedRoute> },
      { path: "user-posts/:id", element: page(<UserPosts />) },
      { path: "notifications", element: page(<Notifications />) },
      { path: "suggestions", element: page(<SuggestedUsersPage />) },
      { path: "Profile", element: page(<Profile />) },
      { path: "Profile/Edit", element: page(<EditProfile />) },
      { path: "PostDetails/:id", element: page(<PostDetails />) },

      { path: "login", element: <AuthProtectedRoute><Login /></AuthProtectedRoute> },
      { path: "register", element: <AuthProtectedRoute><Register /></AuthProtectedRoute> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
import { createBrowserRouter, Navigate } from "react-router";
import Layout from "../../pages/Layout/Layout";
import Post from "../../pages/Post/Post";
import Login from "../../pages/Login/Login";
import Register from "../../pages/Register/Register";
import NotFound from "../../pages/NotFound/NotFound";
import ProtectedRoute from "../../components/ProtectedRouter/ProtectedRoute";
import AuthProtectedRoute from "../../components/AuthProtectedRoute/AuthProtectedRoute";
import PostDetails from "../../pages/PostDetails/PostDetails";
import Profile from "../../components/Profile/Profile";
import EditProfile from "../../components/Profile/EditProfile/EditProfile";
import UserPosts from "../../pages/UserPosts/UserPosts";

export const router = createBrowserRouter([
  {path: "/", element: <Layout />, children: [
    {index: true, element: <Navigate to="/post" replace /> },
    {path: "post", element: <ProtectedRoute><Post /></ProtectedRoute>},
    {path: "user-posts/:id", element: <ProtectedRoute><UserPosts /></ProtectedRoute>},
    {path: "Profile", element: <ProtectedRoute><Profile /></ProtectedRoute>},
    {path: "Profile/Edit", element: (<ProtectedRoute><EditProfile /></ProtectedRoute>),},
    {path: "PostDetails/:id", element: <ProtectedRoute><PostDetails /></ProtectedRoute>},
    {path: "login", element:<AuthProtectedRoute><Login /></AuthProtectedRoute> },
    {path: "register", element: <AuthProtectedRoute><Register /></AuthProtectedRoute>},
    {path: "*", element: <NotFound />},

  ] },
]);     
import { Avatar, Card } from "@heroui/react";
import { useContext } from "react";
import { AuthContext } from "../../context/CounterContext/AuthContext/AuthContext";
import type { AllPostRisponse } from "../../pages/Post/Post.interface";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import PostCard from "../../pages/Post/PostCard/PostCard";
import { Link } from "react-router";

export default function Profile() {
  const { userData } = useContext(AuthContext);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["allPost", userData?._id],

    queryFn: async () => {
      const response = await axios.get<AllPostRisponse>(
        `${import.meta.env.VITE_BASE_URL}/users/${userData?._id}/posts`,
        {
          headers: {
            token: localStorage.getItem("tkn"),
          },
        },
      );

      return response;
    },

    select: (data) => data.data.data.posts,
    enabled: !!userData?._id,
  });

  if (!userData) {
    return <p className="p-5 text-white">Loading...</p>;
  }

  return (
    <>
      {/* Animated Background */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed inset-0 -z-10 overflow-hidden
          bg-slate-950
          before:content-['']
          before:absolute before:inset-[-50%]
          before:-rotate-45
          before:bg-[radial-gradient(4px_100px_at_0px_235px,#ff8c11,transparent),radial-gradient(4px_100px_at_300px_235px,#ff7700,transparent),radial-gradient(4px_100px_at_0px_150px,#f97910,transparent),radial-gradient(4px_100px_at_300px_150px,#ff8012,transparent),radial-gradient(4px_100px_at_150px_0px,#a855f7,transparent),radial-gradient(4px_100px_at_150px_300px,#8b5cf6,transparent),radial-gradient(4px_100px_at_0px_75px,#3b82f6,transparent),radial-gradient(4px_100px_at_300px_75px,#2563eb,transparent)]
          before:bg-size-[300px_235px]
          before:animate-[gradient-flow_20s_linear_infinite]
        "
      />

      {/* Profile Content */}
      <main className="relative z-0 min-h-screen">
        <div className="mx-auto my-24 w-10/12">
          {/* Cover and User Information */}
          <Card className="overflow-hidden bg-gray-400 text-violet-800 dark:bg-olive-500 dark:text-amber-950">
            {/* Cover Image */}
            <div className="h-64">
              <img
                src={userData.photo}
                alt="Cover"
                className="h-full w-full rounded-2xl object-cover"
              />
            </div>

            {/* User Info */}
            <div className="px-6 pb-6">
              <div className="flex items-end justify-between">
                {/* Avatar */}
                <div className="-mt-16">
                  <Avatar className="h-32 w-32 border-4 border-white">
                    <Avatar.Image
                      src={userData.photo}
                      alt={userData.name}
                    />

                    <Avatar.Fallback>
                      {userData.name.charAt(0)}
                    </Avatar.Fallback>
                  </Avatar>
                </div>

                {/* Edit Button - Desktop */}
                <Link to="/Profile/Edit">
                  <button
                    type="button"
                    className="Btn hidden md:flex"
                  >
                    Edit Profile
                  </button>
                </Link>
              </div>

              {/* Edit Button - Mobile */}
              <Link to="/Profile/Edit">
                <button
                  type="button"
                  className="Btn my-4 flex w-full justify-center md:hidden"
                >
                  Edit Profile
                </button>
              </Link>

              {/* Name and Email */}
              <div className="mt-4">
                <h1 className="text-3xl font-bold">
                  {userData.name}
                </h1>

                <p className="text-gray-900">
                  @{userData.username}
                </p>

                <p className="text-gray-900">
                  {userData.email}
                </p>
              </div>

              {/* Statistics */}
              <div className="mt-6 flex flex-wrap gap-10">
                <div>
                  <p className="text-xl font-bold">
                    {userData.followersCount}
                  </p>

                  <p className="text-amber-300 dark:text-sky-300">
                    Followers
                  </p>
                </div>

                <div>
                  <p className="text-xl font-bold">
                    {userData.followingCount}
                  </p>

                  <p className="text-amber-300 dark:text-sky-300">
                    Following
                  </p>
                </div>

                <div>
                  <p className="text-xl font-bold">
                    {userData.bookmarksCount}
                  </p>

                  <p className="text-amber-300 dark:text-sky-300">
                    Bookmarks
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Posts Section */}
          <section className="mt-8">
            {/* My Posts Heading */}
            <div className="flex min-h-50 items-center justify-center perspective-[1000px]">
              <h2
                className="
                  cursor-pointer
                  rounded-xl border-2 border-teal-600
                  bg-teal-500 px-8 py-4
                  text-5xl font-black text-white
                  shadow-2xl
                  transform-3d
                  transition-transform duration-500 ease-out
                  hover:transform-[rotateX(20deg)_rotateY(-20deg)_translateZ(30px)]
                  hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]
                "
              >
                <span className="block transform-[translateZ(40px)]">
                  My Posts
                </span>
              </h2>
            </div>

            {/* Posts List */}
            <div className="mx-auto mt-6 w-full max-w-2xl">
              {isLoading ? (
                <p className="text-center text-white">
                  Loading posts...
                </p>
              ) : posts && posts.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {posts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-2xl text-gray-200">
                  No posts yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
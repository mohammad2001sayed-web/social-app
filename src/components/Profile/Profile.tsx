import { Avatar, Tabs } from "@heroui/react";
import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { AuthContext } from "../../context/CounterContext/AuthContext/AuthContext";
import PostCard from "../../pages/Post/PostCard/PostCard";
import UserList from "./UserList";
import {
  getUserPosts,
  getBookmarks,
  getFollowList,
} from "./Profile.api";
import SuggestedUsersPage from "../../pages/Post/SuggestedUsers/SuggestedUsers";

type TabKey = "posts" | "followers" | "following" | "bookmarks";

export default function Profile() {
  const { userData } = useContext(AuthContext);
  const userId = userData?._id;

  // التاب الـ active واحد، وبيتحكم في الإحصائيات فوق والتابس تحت
  const [tab, setTab] = useState<TabKey>("posts");

  // كل تاب بيجيب داتاه لما يتفتح بس
  const posts = useQuery({
    queryKey: ["allPost", userId],
    queryFn: () => getUserPosts(userId!),
    enabled: !!userId && tab === "posts",
  });

  const bookmarks = useQuery({
    queryKey: ["savedPosts"],
    queryFn: getBookmarks,
    enabled: !!userId && tab === "bookmarks",
  });

  const followers = useQuery({
    queryKey: ["followers", userId],
    queryFn: () => getFollowList(userId!, "followers"),
    enabled: !!userId && tab === "followers",
  });

  const following = useQuery({
    queryKey: ["following", userId],
    queryFn: () => getFollowList(userId!, "following"),
    enabled: !!userId && tab === "following",
  });

  if (!userData) {
    return <p className="p-5 text-gray-700 dark:text-white">Loading...</p>;
  }

  const cover: string | undefined = (userData as any).cover;

  const stats: { key: TabKey; label: string; value: number }[] = [
    { key: "followers", label: "Followers", value: userData.followersCount },
    { key: "following", label: "Following", value: userData.followingCount },
    { key: "bookmarks", label: "Bookmarks", value: userData.bookmarksCount },
  ];

  const tabs: { key: TabKey; label: string }[] = [
    { key: "posts", label: "Posts" },
    { key: "followers", label: "Followers" },
    { key: "following", label: "Following" },
    { key: "bookmarks", label: "Bookmarks" },
  ];

  function renderPosts(list: any[] | undefined, loading: boolean, empty: string) {
    if (loading) {
      return (
        <p className="py-10 text-center text-gray-500 dark:text-gray-400">
          Loading...
        </p>
      );
    }
    if (!list || list.length === 0) {
      return (
        <p className="py-10 text-center text-lg text-gray-500 dark:text-gray-400">
          {empty}
        </p>
      );
    }
    return (
      <div className="flex flex-col gap-4">
        {list.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 pb-10 dark:bg-[#0b0b0f]">
      <div className="mx-auto w-full md:max-w-4xl lg:max-w-5xl">
        {/* =========================
            Header
        ========================= */}
        <section className="overflow-hidden bg-white shadow-sm md:rounded-b-2xl dark:bg-[#18181B]">
          <div className="relative h-44 w-full sm:h-56 md:h-72">
            {cover ? (
              <img src={cover} alt="Cover" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-linear-to-br from-indigo-500 via-violet-500 to-sky-400" />
            )}
          </div>

          <div className="px-4 pb-4 md:px-8">
            <div className="flex flex-col items-center md:flex-row md:items-end md:gap-6">
              <Avatar className="-mt-16 h-32 w-32 shrink-0 border-4 border-white md:-mt-20 md:h-40 md:w-40 dark:border-[#18181B]">
                <Avatar.Image src={userData.photo} alt={userData.name} />
                <Avatar.Fallback>{userData.name.charAt(0)}</Avatar.Fallback>
              </Avatar>

              <div className="mt-3 min-w-0 flex-1 text-center md:mb-2 md:mt-0 md:text-left">
                <h1 className="truncate text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-100">
                  {userData.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @{userData.username}
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {userData.email}
                </p>
              </div>

              <Link to="/Profile/Edit" className="Btn">
                <button type="button">Edit profile</button>
              </Link>
            </div>

            {/* Stats: بتدوسي عليها تفتح التاب، والـ active بيتلوّن */}
            <div className="mt-5 grid grid-cols-3 divide-x divide-gray-200 border-t border-gray-200 pt-4 text-center dark:divide-slate-800 dark:border-slate-800">
              {stats.map((s) => {
                const active = tab === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setTab(s.key)}
                    aria-pressed={active}
                    className="cursor-pointer py-1 transition-colors"
                  >
                    <p
                      className={`text-lg font-bold ${
                        active
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {s.value}
                    </p>
                    <p
                      className={`text-sm ${
                        active
                          ? "font-semibold text-indigo-600 dark:text-indigo-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {s.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================
            Tabs
        ========================= */}
        <Tabs
          className="mt-4 w-full"
          selectedKey={tab}
          onSelectionChange={(key) => setTab(key as TabKey)}
        >
          <Tabs.ListContainer className="px-4 md:px-0">
            <Tabs.List aria-label="Profile sections" className="w-full">
              {tabs.map((t) => (
                <Tabs.Tab key={t.key} id={t.key} className="flex-1 text-xs sm:text-sm">
                  {t.label}
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>

          <Tabs.Panel id="posts" className="mx-auto mt-4 w-full md:max-w-2xl">
            {renderPosts(posts.data, posts.isLoading, "No posts yet.")}
          </Tabs.Panel>

          <Tabs.Panel id="followers" className="mx-auto mt-4 w-full md:max-w-2xl">
            <UserList
              users={followers.data}
              isLoading={followers.isLoading}
              emptyText="No followers yet."
            />
          </Tabs.Panel>

          <Tabs.Panel id="following" className="mx-auto mt-4 w-full md:max-w-2xl">
            <UserList
              users={following.data}
              isLoading={following.isLoading}
              emptyText="You're not following anyone yet."
            />
          </Tabs.Panel>

          <Tabs.Panel id="bookmarks" className="mx-auto mt-4 w-full md:max-w-2xl">
            {renderPosts(bookmarks.data, bookmarks.isLoading, "No saved posts yet.")}
          </Tabs.Panel>
        </Tabs>

        <SuggestedUsersPage/>
      </div>
    </main>
  );
}
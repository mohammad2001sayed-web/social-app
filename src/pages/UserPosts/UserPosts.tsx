import { useContext } from "react";
import { useParams, Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar } from "@heroui/react";
import { Calendar, Sms, User as UserIcon, TickCircle } from "iconsax-react";
import PostCard from "../Post/PostCard/PostCard";
import Loding from "../../components/Loding/Loding";
import { AuthContext } from "../../context/CounterContext/AuthContext/AuthContext";
import { getUserPosts, getUserProfile } from "./user.api";
import { getFollowList } from "../../components/Profile/Profile.api";
import { toggleFollowUser } from "../Post/Post.api"; // عدّلي المسار

/* ---------- كارت عام للسايدبار ---------- */
function SideCard({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#18181B]">
      <header className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-slate-800">
        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        {count !== undefined && (
          <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-slate-800 dark:text-gray-300">
            {count}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}

/* ---------- شريحة معلومة (جنب الاسم) ---------- */
function InfoChip({
  Icon,
  label,
  value,
}: {
  Icon: any;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex min-w-0 max-w-full items-center gap-2 rounded-xl bg-gray-100 px-3 py-1.5 text-xs dark:bg-slate-800">
      <Icon
        size="16"
        color="currentColor"
        className="shrink-0 text-gray-500 dark:text-gray-400"
      />
      <span className="shrink-0 text-gray-500 dark:text-gray-400">{label}</span>
      <span className="truncate font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </span>
    </div>
  );
}

/* ---------- قايمة ناس (Followers / Following) ---------- */
function PeopleList({
  users,
  loading,
  empty,
}: {
  users?: any[];
  loading: boolean;
  empty: string;
}) {
  if (loading) {
    return <p className="h-48 p-5 text-sm text-gray-500">Loading...</p>;
  }
  if (!users || users.length === 0) {
    return <p className="h-48 p-5 text-sm text-gray-500">{empty}</p>;
  }
  return (
    <ul className="h-48 overflow-y-auto px-5">
      {users.map((u) => (
        <li
          key={u._id}
          className="border-b border-gray-100 last:border-0 dark:border-slate-800"
        >
          <Link
            to={`/user-posts/${u._id}`}
            className="flex items-center gap-3 py-3 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <Avatar className="h-9 w-9 shrink-0">
              <Avatar.Image src={u.photo} alt={u.name} />
              <Avatar.Fallback>{u.name?.charAt(0)}</Avatar.Fallback>
            </Avatar>
            <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
              {u.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const fmt = (d?: string, opts?: Intl.DateTimeFormatOptions) =>
  d ? new Date(d).toLocaleDateString("en-US", opts) : undefined;

export default function UserPosts() {
  const { id } = useParams<{ id: string }>();
  const { userData } = useContext(AuthContext);
  const qc = useQueryClient();
  const isMe = userData?._id === id;

  const profile = useQuery({
    queryKey: ["userProfile", id],
    queryFn: () => getUserProfile(id!),
    enabled: !!id,
  });

  const posts = useQuery({
    queryKey: ["userPosts", id],
    queryFn: () => getUserPosts(id!),
    enabled: !!id,
  });

  const followers = useQuery({
    queryKey: ["userFollowers", id],
    queryFn: () => getFollowList(id!, "followers"),
    enabled: !!id,
    retry: false,
  });

  const following = useQuery({
    queryKey: ["userFollowing", id],
    queryFn: () => getFollowList(id!, "following"),
    enabled: !!id,
    retry: false,
  });

  const follow = useMutation({
    mutationFn: () => toggleFollowUser(id!),

    // نحدّث الشاشة فورًا قبل ما السيرفر يرد
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["userProfile", id] });
      const prev = qc.getQueryData<any>(["userProfile", id]);

      qc.setQueryData(["userProfile", id], (old: any) =>
        old
          ? {
              ...old,
              isFollowing: !old.isFollowing,
              followersCount: Math.max(
                0,
                (old.followersCount ?? 0) + (old.isFollowing ? -1 : 1)
              ),
            }
          : old
      );
      return { prev };
    },

    // لو فشل نرجع للحالة القديمة
    onError: (e, _v, ctx) => {
      console.log("follow error:", e);
      if (ctx?.prev) qc.setQueryData(["userProfile", id], ctx.prev);
    },

    // في الآخر نجيب الداتا الصح من السيرفر
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["userProfile", id] });
      qc.invalidateQueries({ queryKey: ["userFollowers", id] });
      qc.invalidateQueries({ queryKey: ["userFollowing", userData?._id] });
      qc.invalidateQueries({ queryKey: ["userPosts", id] });
      qc.invalidateQueries({ queryKey: ["allPost"] });
      qc.invalidateQueries({ queryKey: ["suggestedUsers"] });
    },
  });

  if (profile.isLoading || posts.isLoading) return <Loding />;

  if (profile.isError || posts.isError) {
    const err = (profile.error || posts.error) as unknown;
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-red-500">
          {err instanceof Error ? err.message : "حدث خطأ أثناء جلب البيانات"}
        </h1>
      </div>
    );
  }

  const user = profile.data;
  const postList: any[] = posts.data ?? [];
  const cover: string | undefined = user?.cover;

  const isFollowing: boolean =
    user?.isFollowing ??
    !!followers.data?.some((f: any) => f._id === userData?._id);

  const followersCount = user?.followersCount ?? followers.data?.length ?? 0;
  const followingCount = user?.followingCount ?? following.data?.length ?? 0;

  const stats = [
    { label: "Posts", value: postList.length },
    { label: "Followers", value: followersCount },
    { label: "Following", value: followingCount },
  ];

  return (
    <main className="min-h-screen overflow-x-clip bg-gray-100 pb-24 md:pb-10 dark:bg-[#0b0b0f]">
              {/* ========== Header ========== */}
        <section className="overflow-hidden bg-white shadow-sm md:rounded-b-3xl dark:bg-[#18181B]">
          <div className="relative h-44 w-full sm:h-56 md:h-72">
            {cover ? (
              <img
                src={cover}
                alt="Cover"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-linear-to-br from-indigo-500 via-violet-500 to-sky-400" />
            )}
          </div>

          <div className="px-4 pb-4 md:px-8">
            <div className="flex flex-col items-center md:flex-row md:items-end md:gap-6">
              <Avatar className="-mt-16 h-32 w-32 shrink-0 border-4 border-white md:-mt-20 md:h-40 md:w-40 dark:border-[#18181B]">
                <Avatar.Image src={user?.photo} alt={user?.name} />
                <Avatar.Fallback>{user?.name?.charAt(0)}</Avatar.Fallback>
              </Avatar>

              <div className="mt-3 min-w-0 flex-1 text-center md:mb-2 md:mt-0 md:text-left">
                <h1 className="truncate text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-100">
                  {user?.name}
                </h1>
                {user?.username && (
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    @{user.username}
                  </p>
                )}

                {/* Profile details جنب الاسم */}
                <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
                  <InfoChip Icon={UserIcon} label="Gender" value={user?.gender} />
                  <InfoChip Icon={Sms} label="Email" value={user?.email} />
                  <InfoChip
                    Icon={Calendar}
                    label="Born"
                    value={fmt(user?.dateOfBirth, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  />
                  <InfoChip
                    Icon={Calendar}
                    label="Joined"
                    value={fmt(user?.createdAt, {
                      year: "numeric",
                      month: "long",
                    })}
                  />
                </div>
              </div>

              {/* Follow / Following (مخفي لو ده حسابي) */}
              {!isMe && (
                <div className="mt-3 flex shrink-0 flex-col items-center md:mb-2 md:mt-0">
                  <button
                    type="button"
                    onClick={() => follow.mutate()}
                    disabled={follow.isPending}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                      isFollowing
                        ? "border-gray-200 bg-white text-gray-800 hover:bg-gray-50 dark:border-slate-700 dark:bg-transparent dark:text-gray-100 dark:hover:bg-slate-800"
                        : "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {isFollowing && (
                      <TickCircle size="18" color="currentColor" variant="Bold" />
                    )}
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                  {follow.isError && (
                    <p className="mt-1 text-xs text-red-500">
                      {(follow.error as any)?.response?.data?.message ??
                        "Follow failed"}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-3 divide-x divide-gray-200 border-t border-gray-200 pt-4 text-center dark:divide-slate-800 dark:border-slate-800">
              {stats.map((s) => (
                <div key={s.label} className="py-1">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {s.value}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

      <div className="mx-auto w-full max-w-6xl">

        {/* ========== Posts + Sidebar ========== */}
        <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:px-4">
          {/* البوستات */}
          <div className="min-w-0 lg:col-span-7">
            <div className="mb-4 border-b border-gray-200 px-4 dark:border-slate-800 lg:px-0">
              <span className="relative inline-block px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                Posts
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              </span>
            </div>

            <div className="flex flex-col gap-4 px-4 lg:px-0">
              {postList.length > 0 ? (
                postList.map((post) => <PostCard key={post._id} post={post} />)
              ) : (
                <p className="py-10 text-center text-lg text-gray-500 dark:text-gray-400">
                  لا توجد منشورات لهذا المستخدم حتى الآن.
                </p>
              )}
            </div>
          </div>

          {/* Followers + Following تحت بعض، sticky، من غير overflow أفقي */}
          <aside className="flex min-w-0 flex-col gap-4 overflow-x-hidden px-4 lg:sticky lg:top-9 lg:col-span-5 lg:self-start lg:px-0">
            <SideCard title="Followers" count={followersCount}>
              <PeopleList
                users={followers.data}
                loading={followers.isLoading}
                empty="No followers yet."
              />
            </SideCard>

            <SideCard title="Following" count={followingCount}>
              <PeopleList
                users={following.data}
                loading={following.isLoading}
                empty="Not following anyone yet."
              />
            </SideCard>
          </aside>
        </div>
      </div>
    </main>
  );
}
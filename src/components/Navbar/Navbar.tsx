import { Avatar, Button } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import {
  Monero,
  Moon,
  Sun1,
  Home2,
  Profile as ProfileIcon,
  Notification,
} from "iconsax-react";
import { useContext, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { AuthContext } from "../../context/CounterContext/AuthContext/AuthContext";
import { getUnreadCount, uploadProfilePhoto } from "./Navbar.api";

interface NavbarProps {
  darkmode: boolean;
  setdarkmode: React.Dispatch<React.SetStateAction<boolean>>;
}

// الكلمة اللي بتظهر لما تعملي hover (ديسكتوب بس)
function Tip({ label }: { label: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 md:block dark:bg-slate-100 dark:text-slate-900"
    >
      {label}
    </span>
  );
}

const itemBase =
  "group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 md:h-10 md:w-10";
const itemActive =
  "bg-indigo-600 text-white shadow-md shadow-indigo-500/40";
const itemIdle =
  "text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400";

export default function Navbar({ darkmode, setdarkmode }: NavbarProps) {
  const [isdropdown, setisdropdown] = useState(false);

  const { userData, setuserData, getUserData, userToken, setUserToken } =
    useContext(AuthContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useNavigate();

  // عدد الإشعارات الجديدة، بيتحدث كل 30 ثانية
  const { data: unread = 0 } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: getUnreadCount,
    enabled: !!userToken,
    refetchInterval: 30_000,
  });

  async function uploadPhoto(file: File) {
    try {
      await uploadProfilePhoto(file);
      const updatedUser = await getUserData();
      setuserData(updatedUser);
      setisdropdown(false);
    } catch (error) {
      console.log(error);
    }
  }

  function handleLogout() {
    localStorage.removeItem("tkn");
    setUserToken(null);
    setuserData(null);
    setisdropdown(false);
    router("/login");
  }

  const links = [
    { name: "Posts", href: "/post", Icon: Home2 },
    { name: "Profile", href: "/profile", Icon: ProfileIcon },
    { name: "Notifications", href: "/notifications", Icon: Notification },
  ];

  return (
    <nav
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 rounded-2xl border border-slate-200 bg-white/90 text-slate-800 shadow-xl backdrop-blur-xl transition-colors duration-300 md:inset-x-0 md:bottom-auto md:top-0 md:rounded-none md:border-x-0 md:border-t-0 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 md:px-4">
        {/* Logo: على الموبايل بيظهر بس لو مش عامل لوجن */}
        <Link
          to=""
          aria-label="Home"
          className={`items-center ${userToken ? "hidden md:flex" : "flex"}`}
        >
          <Monero size="32" color="#37d67a" />
        </Link>

        {/* Links (أيقونات بس) */}
        {userToken && (
          <ul className="flex flex-1 items-center justify-around md:flex-none md:gap-3">
            {links.map(({ name, href, Icon }) => {
              const isBell = href === "/notifications";
              return (
                <li key={href}>
                  <NavLink
                    to={href}
                    aria-label={name}
                    className={({ isActive }) =>
                      `${itemBase} ${isActive ? itemActive : itemIdle}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size="24"
                          color="currentColor"
                          // الجرس بيتملي لو فيه إشعار جديد
                          variant={
                            isActive || (isBell && unread > 0)
                              ? "Bold"
                              : "Outline"
                          }
                        />

                        {isBell && unread > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5">
                            <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-60" />
                            <span className="relative flex h-full min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-slate-900">
                              {unread > 99 ? "99+" : unread}
                            </span>
                          </span>
                        )}

                        <Tip label={name} />
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        )}

        {/* Controls */}
        <div className="flex items-center gap-1 md:gap-3">
          <button
            type="button"
            aria-label={darkmode ? "Light mode" : "Dark mode"}
            onClick={() => {
              const newMode = !darkmode;
              setdarkmode(newMode);
              localStorage.setItem("darkmode", String(newMode));
            }}
            className={`${itemBase} ${itemIdle} cursor-pointer`}
          >
            {darkmode ? (
              <Moon size="24" color="#6366f1" variant="Bold" />
            ) : (
              <Sun1 size="24" color="#f59e0b" variant="Bold" />
            )}
            <Tip label={darkmode ? "Light mode" : "Dark mode"} />
          </button>

          {userToken ? (
            <>
              <button
                type="button"
                aria-label="Account"
                aria-expanded={isdropdown}
                onClick={() => setisdropdown((v) => !v)}
                className="group relative flex cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Avatar className="ring-2 ring-indigo-500/40">
                  <Avatar.Image
                    alt={userData?.name || "User"}
                    src={userData?.photo}
                  />
                  <Avatar.Fallback>
                    {userData?.name
                      ? userData.name.substring(0, 2).toUpperCase()
                      : "U"}
                  </Avatar.Fallback>
                </Avatar>
                <Tip label="Account" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPhoto(file);
                }}
              />
            </>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="rounded-md bg-teal-400 px-2 py-0.5 transition-colors hover:bg-teal-600"
              >
                <Button className="pointer-events-none">Login</Button>
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-violet-400 px-2 py-0.5 transition-colors hover:bg-violet-500 dark:hover:bg-violet-600"
              >
                <Button className="pointer-events-none">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown: لفوق على الموبايل، لتحت على الديسكتوب */}
      <div
        id="user-dropdown"
        className={`absolute bottom-full right-0 z-50 mb-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl md:bottom-auto md:right-4 md:top-full md:mb-0 md:mt-1 dark:border-slate-700 dark:bg-[#0f1f38] dark:text-white ${
          isdropdown ? "block" : "hidden"
        }`}
      >
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-[#091527]/50">
          <span className="block font-semibold">{userData?.name || "User"}</span>
          <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
            {userData?.email || ""}
          </span>
        </div>
        <ul className="p-2 text-sm font-medium">
          <li
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full cursor-pointer items-center rounded-xl p-2.5 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Change profile picture
          </li>
          <Link to="/Profile/Edit">
          <li className="flex w-full cursor-pointer items-center rounded-xl p-2.5 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400">
            Settings
          </li>
          </Link>
          <li
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center rounded-xl p-2.5 text-red-500 transition-colors hover:bg-red-500/10 dark:text-red-400"
          >
            Sign out
          </li>
        </ul>
      </div>
    </nav>
  );
}
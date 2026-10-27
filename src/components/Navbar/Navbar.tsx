import { Avatar, Button } from "@heroui/react";
import axios from "axios";
import { Monero, Moon, Sun1 } from "iconsax-react";
import { useContext, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { AuthContext } from "../../context/CounterContext/AuthContext/AuthContext";

interface NavbarProps {
  darkmode: boolean;
  setdarkmode: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Navbar({ darkmode, setdarkmode }: NavbarProps) {
  const [isdropdown, setisdropdown] = useState<boolean>(false);
  const [isopen, setisopen] = useState<boolean>(false);

  // 1. استدعاء userToken و setUserToken من الـ AuthContext
  const { userData, setuserData, getUserData, userToken, setUserToken } =
    useContext(AuthContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleChangePhoto() {
    fileInputRef.current?.click();
  }

  async function uploadPhoto(file: File) {
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const baseUrl =
        import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL;

      await axios.put(`${baseUrl}/users/upload-photo`, formData, {
        headers: {
          token: localStorage.getItem("tkn"),
        },
      });

      const updatedUser = await getUserData();
      setuserData(updatedUser);
      setisdropdown(false);
    } catch (error) {
      console.log(error);
    }
  }

  const links = [
    { name: "Posts", href: "/post" },
    { name: "Profile", href: "/profile" },
  ];

  const router = useNavigate();

  // 2. تحديث دالة الـ Logout لمسح الـ userToken وإعادة التوجيه صح
  function handleLogout() {
    localStorage.removeItem("tkn");
    setUserToken(null);
    setuserData(null);
    setisdropdown(false);
    router("/login");
  }

  return (
    <>
      {/* خلفية الـ Navbar الأساسية */}
      <nav className="bg-slate-400 pb-1 dark:bg-[#091527] text-slate-800 dark:text-slate-100 shadow-xl fixed w-full z-20 top-0 inset-s-0 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl flex flex-wrap items-center justify-between mx-auto px-4 pt-2">
          <Link
            to=""
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <Monero size="32" color="#37d67a" />
          </Link>

          <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <div
              className="cursor-pointer me-3 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              onClick={() => {
                const newMode = !darkmode;
                setdarkmode(newMode);
                localStorage.setItem("darkmode", String(newMode));
              }}
            >
              {darkmode ? (
                <Moon size="28" color="#6366f1" />
              ) : (
                <Sun1 size="28" color="#f59e0b" />
              )}
            </div>

            {/* 3. الاعتماد على userToken لمعرفة هل المستخدم مسجل دخول أم لا */}
            {userToken ? (
              <button
                onClick={() => setisdropdown(!isdropdown)}
                type="button"
                className="flex cursor-pointer text-sm bg-neutral-primary rounded-full md:me-0 focus:ring-2 focus:ring-indigo-500"
                id="user-menu-button"
              >
                <Avatar className="ring-2 ring-indigo-500/40 shadow-md">
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      uploadPhoto(file);
                    }
                  }}
                />
              </button>
            ) : (
              <div className="flex gap-2.5">
                <Link
                  to="/login"
                  className="bg-teal-400 hover:bg-teal-600 rounded-md px-2 py-0.5 transition-colors"
                >
                  <Button className=" pointer-events-none">Login</Button>
                </Link>
                <Link
                  to="/register"
                  className="bg-violet-400 hover:bg-violet-500 dark:hover:bg-violet-600 rounded-md px-2 py-0.5 transition-colors"
                >
                  <Button className=" pointer-events-none">Register</Button>
                </Link>
              </div>
            )}

            {/* Dropdown menu */}
            <div
              className={`z-50 ${
                isdropdown ? "block" : "hidden"
              } absolute top-full right-4 bg-white dark:bg-[#0f1f38] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl shadow-2xl w-48 overflow-hidden`}
              id="user-dropdown"
            >
              <div className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#091527]/50">
                <span className="block font-semibold">
                  {userData?.name || "User"}
                </span>
                <span className="block truncate text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  {userData?.email || ""}
                </span>
              </div>
              <ul className="p-2 text-sm font-medium">
                <li
                  onClick={handleChangePhoto}
                  className="inline-flex items-center w-full p-2.5 rounded-xl cursor-pointer hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Change profile picture
                </li>
                <li className="inline-flex items-center w-full p-2.5 rounded-xl cursor-pointer hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Settings
                </li>
                <li
                  onClick={handleLogout}
                  className="inline-flex items-center w-full p-2.5 rounded-xl cursor-pointer hover:bg-red-500/10 text-red-500 dark:text-red-400 transition-colors"
                >
                  Sign out
                </li>
              </ul>
            </div>

            <button
              onClick={() => setisopen(!isopen)}
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-base md:hidden hover:bg-neutral-secondary-soft focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-6 h-6"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth={2}
                  d="M5 7h14M5 12h14M5 17h14"
                />
              </svg>
            </button>
          </div>

          <div
            className={`items-center justify-between ${
              isopen ? "block" : "hidden"
            } w-full md:flex md:w-auto md:order-1`}
            id="navbar-user"
          >
            <ul className="font-medium flex flex-col md:flex-row md:space-x-6 rtl:space-x-reverse mt-4 md:mt-0">
              {/* 4. إظهار الروابط بمجرد وجود userToken */}
              {userToken &&
                links.map((link) => (
                  <li key={link.href}>
                    <NavLink
                      to={link.href}
                      className={({ isActive }) =>
                        `relative px-8 py-3 font-bold transition-all duration-300 capitalize flex flex-col items-center justify-center gap-1 ${
                          isActive
                            ? "bg-slate-200 dark:bg-[#030712] text-indigo-600 dark:text-indigo-400 rounded-t-2xl " +
                              "shadow-[inset_0_4px_8px_rgba(0,0,0,0.25),inset_0_-1px_2px_rgba(255,255,255,0.1)] " +
                              "border-t border-x border-indigo-500/30 dark:border-indigo-500/20 " +
                              "before:content-[''] before:absolute before:-left-4 before:bottom-0 before:w-4 before:h-4 " +
                              "before:rounded-br-2xl before:shadow-[4px_4px_0_0_#e2e8f0] dark:before:shadow-[4px_4px_0_0_#030712] " +
                              "after:content-[''] after:absolute after:-right-4 after:bottom-0 after:w-4 after:h-4 " +
                              "after:rounded-bl-2xl after:shadow-[-4px_4px_0_0_#e2e8f0] dark:after:shadow-[-4px_4px_0_0_#030712]"
                            : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white rounded-t-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                        }`
                      }
                    >
                      <span>
                        {link.name.at(0)?.toUpperCase() + link.name.slice(1)}
                      </span>

                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_8px_2px_rgba(99,102,241,0.8)] animate-pulse" />
                    </NavLink>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

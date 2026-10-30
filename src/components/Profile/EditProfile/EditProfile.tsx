import { Avatar, Button, Input, Label } from "@heroui/react";
import { useContext, useRef, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/CounterContext/AuthContext/AuthContext";
import toast from "react-hot-toast";
import { Camera, Lock, ShieldSecurity, User as UserIcon } from "iconsax-react";

export default function EditProfile() {
  const { userData, setuserData, getUserData } = useContext(AuthContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Password Form States
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // =========================
  // Change Photo
  // =========================
  function handleChangePhoto() {
    fileInputRef.current?.click();
  }

  async function uploadPhoto(file: File) {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("photo", file);

      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/users/upload-photo`,
        formData,
        {
          headers: { token: localStorage.getItem("tkn") },
        }
      );

      const updatedUser = await getUserData();
      setuserData(updatedUser);
      toast.success("Profile picture updated successfully!");
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to update picture");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // Change Password
  // =========================
  async function changePassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setPasswordLoading(true);

      const res = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/users/change-password`,
        { password, newPassword },
        {
          headers: { token: localStorage.getItem("tkn") },
        }
      );

      if (res.data.data?.token) {
        localStorage.setItem("tkn", res.data.data.token);
      }

      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully!");
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  }

  if (!userData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <p className="text-gray-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4 dark:bg-slate-950 transition-colors duration-300">
      <div className="mx-auto max-w-xl">
        
        {/* كارد الإعدادات الرئيسي */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-100/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none transition-all">
          
          {/* رأس الكارد */}
          <div className="border-b border-gray-100 px-8 py-6 dark:border-slate-800 bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-950/20">
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ShieldSecurity className="text-indigo-600" size="24" />
              Account Settings
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Manage your profile picture and secure your account credentials.
            </p>
          </div>

          <div className="p-8 flex flex-col gap-8">

            {/* =========================================
                1. قسم صورة البروفايل (تصميم عصري ومنعزل)
            ========================================= */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-gray-50/80 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800">
              <div className="relative group cursor-pointer" onClick={handleChangePhoto}>
                <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-slate-900 shadow-md">
                  <Avatar.Image src={userData.photo} alt={userData.name} />
                  <Avatar.Fallback className="text-xl font-bold">
                    {userData.name?.charAt(0).toUpperCase()}
                  </Avatar.Fallback>
                </Avatar>
                
                {/* زر الكاميرا العائم للتوضيح */}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size="24" color="#fff" />
                </div>
              </div>

              <div className="text-center sm:text-left flex-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {userData.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {userData.email}
                </p>
                
                <Button
                  size="sm"
                  onPress={handleChangePhoto}
                  isDisabled={loading}
                  className="mt-3 font-semibold text-xs h-8 px-4 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 transition-all"
                >
                  {loading ? "Uploading..." : "Change Avatar"}
                </Button>
              </div>

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
            </div>

            {/* =========================================
                2. قسم تغيير كلمة المرور (أنيق ومرتب)
            ========================================= */}
            <form onSubmit={changePassword} className="flex flex-col gap-5">
              <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-bold text-sm">
                <Lock size="18" className="text-indigo-600" />
                <h2>Security & Password</h2>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Current Password
                </Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    New Password
                  </Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Confirm New Password
                  </Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  type="submit"
                  isDisabled={passwordLoading}
                  className="bg-indigo-600 text-white font-semibold text-xs h-10 px-6 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-600/20"
                >
                  {passwordLoading ? "Updating Password..." : "Update Password"}
                </Button>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
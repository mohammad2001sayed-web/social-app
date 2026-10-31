import { Avatar, Button, Input, Label } from "@heroui/react";
import { useContext, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Camera,
  Eye,
  EyeSlash,
  Gallery,
  Lock,
  ShieldSecurity,
  TickCircle,
  CloseCircle,
} from "iconsax-react";
import { AuthContext } from "../../../context/CounterContext/AuthContext/AuthContext";

const BASE = import.meta.env.VITE_BASE_URL;
const PHOTO_ENDPOINT = `${BASE}/users/upload-photo`;
const COVER_ENDPOINT = `${BASE}/users/upload-cover`; // غيّريه لو المسار مختلف
const MAX_MB = 5;

/* ---------- قواعد الباسورد ---------- */
const rules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  {
    label: "One special character",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

/* ---------- حقل الباسورد مع زرار العين ---------- */
function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  invalid?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
        {label}
      </Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          autoComplete={autoComplete}
          aria-invalid={invalid}
          className={`w-full pr-11 ${invalid ? "border-red-500" : ""}`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
        >
          {show ? (
            <EyeSlash size="18" color="currentColor" />
          ) : (
            <Eye size="18" color="currentColor" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function EditProfile() {
  const { userData, setuserData, getUserData } = useContext(AuthContext);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [photoLoading, setPhotoLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // معاينة الكفر فورًا قبل ما الرفع يخلص
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ---------- Validation ----------
  const ruleResults = rules.map((r) => ({ ...r, ok: r.test(newPassword) }));
  const allRulesOk = ruleResults.every((r) => r.ok);
  const sameAsOld = newPassword.length > 0 && newPassword === password;
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit =
    !!password && allRulesOk && !sameAsOld && !!confirmPassword && !mismatch;

  const authHeaders = () => ({
    headers: { token: localStorage.getItem("tkn") || "" },
  });

  function validate(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return false;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_MB}MB`);
      return false;
    }
    return true;
  }

  // =========================
  // Upload (photo / cover)
  // =========================
  async function upload(file: File, kind: "photo" | "cover") {
    if (!validate(file)) return;

    const isCover = kind === "cover";
    const setBusy = isCover ? setCoverLoading : setPhotoLoading;
    if (isCover) setCoverPreview(URL.createObjectURL(file));

    try {
      setBusy(true);
      const formData = new FormData();
      formData.append(kind, file);

      await axios.put(
        isCover ? COVER_ENDPOINT : PHOTO_ENDPOINT,
        formData,
        authHeaders(),
      );

      const updatedUser = await getUserData();
      setuserData(updatedUser);
      toast.success(isCover ? "Cover updated!" : "Profile picture updated!");
    } catch (error: any) {
      console.log(error);
      if (isCover) setCoverPreview(null); // رجّع القديم لو فشل
      toast.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setBusy(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  // =========================
  // Change Password
  // =========================
  async function changePassword(e: React.FormEvent) {
    e.preventDefault();

    if (!allRulesOk) {
      toast.error("New password doesn't meet all the requirements");
      return;
    }
    if (sameAsOld) {
      toast.error("New password must be different from the current one");
      return;
    }
    if (mismatch) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await axios.patch(
        `${BASE}/users/change-password`,
        { password, newPassword },
        authHeaders(),
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="font-medium text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const coverSrc = coverPreview || (userData as any).cover || "";

  return (
    <main className="min-h-screen overflow-x-clip bg-gray-100 pb-24 md:pb-10 dark:bg-[#0b0b0f]">
      <div className="mx-auto w-full max-w-3xl md:px-4">
        {/* ========== Header: Cover + Avatar ========== */}
        <section className="overflow-hidden bg-white shadow-sm md:rounded-b-3xl dark:bg-[#18181B]">
          {/* Cover */}
          <div className="group relative h-40 w-full sm:h-52 md:h-60">
            {coverSrc ? (
              <img
                src={coverSrc}
                alt="Cover"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-linear-to-br from-indigo-500 via-violet-500 to-sky-400" />
            )}

            {coverLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                Uploading cover...
              </div>
            )}

            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverLoading}
              className="absolute bottom-3 right-3 flex cursor-pointer items-center gap-2 rounded-xl bg-black/50 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-black/70 disabled:opacity-60"
            >
              <Gallery size="18" color="currentColor" />
              {coverSrc ? "Change cover" : "Add cover"}
            </button>

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file, "cover");
              }}
            />
          </div>

          {/* Avatar + name */}
          <div className="px-4 pb-6 md:px-8">
            <div className="flex flex-col items-center sm:flex-row sm:items-end sm:gap-5">
              <div className="relative -mt-14 shrink-0 sm:-mt-16">
                <Avatar className="h-28 w-28 border-4 border-white sm:h-32 sm:w-32 dark:border-[#18181B]">
                  <Avatar.Image src={userData.photo} alt={userData.name} />
                  <Avatar.Fallback className="text-2xl font-bold">
                    {userData.name?.charAt(0).toUpperCase()}
                  </Avatar.Fallback>
                </Avatar>

                <button
                  type="button"
                  aria-label="Change profile picture"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={photoLoading}
                  className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-md transition-colors hover:bg-indigo-700 disabled:opacity-60 dark:border-[#18181B]"
                >
                  <Camera size="18" color="currentColor" variant="Bold" />
                </button>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) upload(file, "photo");
                  }}
                />
              </div>

              <div className="mt-3 min-w-0 flex-1 text-center sm:mb-2 sm:mt-0 sm:text-left">
                <h1 className="truncate text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {userData.name}
                </h1>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  @{(userData as any).username} · {userData.email}
                </p>
                {photoLoading && (
                  <p className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    Uploading picture...
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========== Security ========== */}
        <section className="mx-4 mt-4 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm md:mx-0 dark:border-slate-800 dark:bg-[#18181B]">
          <header className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 dark:border-slate-800">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShieldSecurity size="20" color="currentColor" variant="Bold" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Security & Password
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Use a strong password you don't use anywhere else.
              </p>
            </div>
          </header>

          <form
            onSubmit={changePassword}
            noValidate
            className="flex flex-col gap-5 p-6"
          >
            <PasswordField
              label="Current Password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />

            <PasswordField
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              invalid={sameAsOld}
            />

            {/* شروط الباسورد: بتظهر أول ما تبدأي تكتبي */}
            {newPassword.length > 0 && (
              <ul className="grid grid-cols-1 gap-1.5 rounded-xl bg-gray-50 p-3 sm:grid-cols-2 dark:bg-slate-800/50">
                {ruleResults.map((r) => (
                  <li
                    key={r.label}
                    className={`flex items-center gap-2 text-xs transition-colors ${
                      r.ok
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {r.ok ? (
                      <TickCircle size="16" color="currentColor" variant="Bold" />
                    ) : (
                      <CloseCircle size="16" color="currentColor" />
                    )}
                    {r.label}
                  </li>
                ))}
              </ul>
            )}
            {sameAsOld && (
              <p className="-mt-3 text-xs text-red-500">
                New password must be different from the current one
              </p>
            )}

            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              invalid={mismatch}
            />
            {mismatch && (
              <p className="-mt-3 text-xs text-red-500">
                Passwords don't match
              </p>
            )}

            <div className="flex justify-end border-t border-gray-100 pt-5 dark:border-slate-800">
              <Button
                type="submit"
                isDisabled={passwordLoading || !canSubmit}
                className="h-10 rounded-xl bg-indigo-600 px-6 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
              >
                <Lock size="16" color="currentColor" />
                {passwordLoading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
import { forwardRef, useId, useState } from "react";
import { Link, useLocation } from "react-router";
import { Eye, EyeSlash } from "iconsax-react";

export const APP_NAME = "Circle"; // غيّريه لاسم مشروعك

/* =========================================================
   CSS الخاص بصفحات الدخول (neumorphism + animations)
   متضمن هنا عشان الملف يشتغل من غير ما تعدّلي index.css
========================================================= */
const CSS = `
.neu-scope{--bg:#e4e9f1;--hi:#ffffff;--lo:#bcc5d6;--ink:#2b3045;--mute:#5f6a82;--accent:#4f46e5;background:var(--bg);color:var(--ink)}
.dark .neu-scope{--bg:#1e2230;--hi:#2a2f44;--lo:#12141d;--ink:#e8ebf7;--mute:#8d96b0;--accent:#8b8ff5;color-scheme:dark}

/* بارز */
.neu-raised{background:var(--bg);box-shadow:9px 9px 20px var(--lo),-9px -9px 20px var(--hi)}
.neu-raised-sm{background:var(--bg);box-shadow:5px 5px 11px var(--lo),-5px -5px 11px var(--hi)}
/* محفور */
.neu-inset{background:var(--bg);box-shadow:inset 6px 6px 12px var(--lo),inset -6px -6px 12px var(--hi)}
/* ضغطة الزرار */
.neu-press:active:not(:disabled){box-shadow:inset 5px 5px 10px var(--lo),inset -5px -5px 10px var(--hi);transform:translateY(1px)}

/* الحقل: بيتحفر أكتر لما تركزي عليه */
.neu-field{transition:box-shadow .25s ease}
.neu-field:focus-within{box-shadow:inset 7px 7px 14px var(--lo),inset -7px -7px 14px var(--hi),0 0 0 2px color-mix(in srgb,var(--accent) 60%,transparent)}
.neu-field[data-invalid="true"]{box-shadow:inset 6px 6px 12px var(--lo),inset -6px -6px 12px var(--hi),0 0 0 2px rgba(220,38,38,.65)}
.neu-field .neu-icon{transition:color .25s ease}
.neu-field:focus-within .neu-icon{color:var(--accent)}
.neu-field input:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px var(--bg) inset;-webkit-text-fill-color:var(--ink)}

.neu-scope :is(a,button):focus-visible{outline:2px solid var(--accent);outline-offset:2px}

/* حركات */
@keyframes auth-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes auth-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes auth-pill-from-right{from{transform:translateX(100%)}to{transform:none}}
@keyframes auth-pill-from-left{from{transform:translateX(-100%)}to{transform:none}}
@keyframes auth-spin{to{transform:rotate(360deg)}}

.auth-rise{animation:auth-rise .6s cubic-bezier(.2,.8,.2,1) both}
.auth-float{animation:auth-float 5s ease-in-out infinite}
.auth-pill-from-right{animation:auth-pill-from-right .35s cubic-bezier(.4,0,.2,1)}
.auth-pill-from-left{animation:auth-pill-from-left .35s cubic-bezier(.4,0,.2,1)}

.auth-stagger>*{animation:auth-rise .5s cubic-bezier(.2,.8,.2,1) both}
.auth-stagger>*:nth-child(1){animation-delay:.08s}
.auth-stagger>*:nth-child(2){animation-delay:.14s}
.auth-stagger>*:nth-child(3){animation-delay:.2s}
.auth-stagger>*:nth-child(4){animation-delay:.26s}
.auth-stagger>*:nth-child(5){animation-delay:.32s}
.auth-stagger>*:nth-child(6){animation-delay:.38s}
.auth-stagger>*:nth-child(7){animation-delay:.44s}
.auth-stagger>*:nth-child(8){animation-delay:.5s}
.auth-stagger>*:nth-child(9){animation-delay:.56s}

@media (prefers-reduced-motion:reduce){
  .auth-rise,.auth-float,.auth-pill-from-right,.auth-pill-from-left,.auth-stagger>*{animation:none!important}
}
`;

/* =========================================================
   Logo: فقاعة شات + قلب (نفس لوجو النافبار)
========================================================= */
export function Logo({ size = 40 }: { size?: number }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="4" y1="4" x2="44" y2="44">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="0.55" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#${id})`} />
      <path
        d="M14 15.5C14 13.6 15.6 12 17.5 12h13c1.9 0 3.5 1.6 3.5 3.5v9c0 1.9-1.6 3.5-3.5 3.5H26l-5.2 5.1c-.6.6-1.6.2-1.6-.7V28h-1.7c-1.9 0-3.5-1.6-3.5-3.5v-9z"
        fill="#fff"
      />
      <path
        d="M24 25.2s-4.6-2.9-4.6-5.8c0-1.5 1.1-2.5 2.4-2.5.9 0 1.7.5 2.2 1.3.5-.8 1.3-1.3 2.2-1.3 1.3 0 2.4 1 2.4 2.5 0 2.9-4.6 5.8-4.6 5.8z"
        fill="#ec4899"
      />
      <circle cx="36" cy="12" r="3.5" fill="#fbbf24" stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}

const wordmark =
  "bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text font-extrabold tracking-tight text-transparent";

/* =========================================================
   التبديل بين Login و Register (الدائرة بتنزلق)
========================================================= */
function AuthSwitch({ mode }: { mode: "login" | "register" }) {
  const location = useLocation();
  const switched = !!(location.state as { switched?: boolean } | null)?.switched;
  const isLogin = mode === "login";

  const tab = (active: boolean) =>
    `relative z-10 flex h-10 items-center justify-center rounded-xl text-sm font-bold transition-colors duration-300 ${
      active
        ? "text-[var(--accent)]"
        : "text-[var(--mute)] hover:text-[var(--ink)]"
    }`;

  return (
    <div
      role="tablist"
      aria-label="Login or register"
      className="neu-inset relative grid grid-cols-2 rounded-2xl p-1.5"
    >
      <span
        aria-hidden
        className={`neu-raised-sm absolute inset-y-1.5 w-[calc(50%-0.375rem)] rounded-xl ${
          isLogin ? "left-1.5" : "left-1/2"
        } ${
          switched
            ? isLogin
              ? "auth-pill-from-right"
              : "auth-pill-from-left"
            : ""
        }`}
      />
      <Link
        to="/login"
        replace
        state={{ switched: true }}
        role="tab"
        aria-selected={isLogin}
        className={tab(isLogin)}
      >
        Login
      </Link>
      <Link
        to="/register"
        replace
        state={{ switched: true }}
        role="tab"
        aria-selected={!isLogin}
        className={tab(!isLogin)}
      >
        Register
      </Link>
    </div>
  );
}

/* =========================================================
   الإطار العام: لوحة اللوجو + الفورم
========================================================= */
const CHIPS = [
  { label: "Share moments", color: "#6366f1" },
  { label: "Follow friends", color: "#ec4899" },
  { label: "Get notified", color: "#f59e0b" },
];

export function AuthShell({
  mode,
  children,
}: {
  mode: "login" | "register";
  children: React.ReactNode;
}) {
  const isLogin = mode === "login";

  return (
    <main className="neu-scope flex min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-x-clip px-4 py-8 md:min-h-[calc(100vh-4rem)]">
      <style>{CSS}</style>

      <div className="neu-raised auth-rise grid w-full max-w-5xl rounded-[2rem] p-3 sm:p-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* ===== لوحة اللوجو (ديسكتوب بس) ===== */}
        <aside className="neu-inset relative hidden overflow-hidden rounded-3xl p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="neu-raised inline-flex rounded-3xl p-3">
              <Logo size={56} />
            </div>
            <p className={`mt-6 text-4xl ${wordmark}`}>{APP_NAME}</p>
            <h2 className="mt-4 max-w-xs text-xl font-semibold leading-snug">
              Stay close to the people who matter.
            </h2>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-(--mute)">
              Share what is happening, follow friends and never miss a reply.
            </p>
          </div>

          <ul className="mt-10 flex flex-col gap-3" aria-hidden>
            {CHIPS.map((c, i) => (
              <li
                key={c.label}
                className="neu-raised-sm auth-float flex w-fit items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold"
                style={{
                  animationDelay: `${i * 0.7}s`,
                  marginLeft: i % 2 ? 28 : 0,
                }}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: c.color }}
                />
                {c.label}
              </li>
            ))}
          </ul>
        </aside>

        {/* ===== الفورم ===== */}
        <section className="min-w-0 px-3 py-6 sm:px-8 sm:py-8 lg:px-10">
          <div
            className={`mx-auto w-full ${isLogin ? "max-w-md" : "max-w-xl"}`}
          >
            {/* لوجو صغير للموبايل */}
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <Logo size={40} />
              <span className={`text-2xl ${wordmark}`}>{APP_NAME}</span>
            </div>

            <AuthSwitch mode={mode} />

            <header className="mb-6 mt-7">
              <h1 className="text-2xl font-extrabold tracking-tight">
                {isLogin ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-1 text-sm text-(--mute)">
                {isLogin
                  ? "Log in to see what your friends are up to."
                  : "It only takes a minute to get started."}
              </p>
            </header>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   حقل محفور (متوافق مع react-hook-form register)
========================================================= */
type NeuInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  Icon: React.ElementType;
  error?: string;
  wrapperClassName?: string;
};

export const NeuInput = forwardRef<HTMLInputElement, NeuInputProps>(
  function NeuInput(
    { label, Icon, error, type = "text", wrapperClassName = "", ...rest },
    ref,
  ) {
    const id = useId();
    const [show, setShow] = useState(false);
    const isPassword = type === "password";

    return (
      <div className={`min-w-0 ${wrapperClassName}`}>
        <label
          htmlFor={id}
          className="mb-1.5 ms-1 block text-xs font-semibold text-(--mute)"
        >
          {label}
        </label>

        <div
          className="neu-field neu-inset flex items-center gap-2 rounded-2xl px-4"
          data-invalid={!!error}
        >
          <span className="neu-icon shrink-0 text-(--mute)">
            <Icon size="18" color="currentColor" />
          </span>

          <input
            id={id}
            ref={ref}
            type={isPassword && show ? "text" : type}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className="h-12 min-w-0 flex-1 bg-transparent text-sm text-(--ink) outline-none placeholder:text-(--mute)"
            {...rest}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              aria-pressed={show}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-(--mute) transition-colors hover:text-accent"
            >
              {show ? (
                <EyeSlash size="18" color="currentColor" />
              ) : (
                <Eye size="18" color="currentColor" />
              )}
            </button>
          )}
        </div>

        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="mt-1.5 ms-1 text-xs font-medium text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

/* =========================================================
   زرار بارز (بيتضغط لجوه)
========================================================= */
function Spinner() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ animation: "auth-spin .8s linear infinite" }}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity=".25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function NeuButton({
  loading,
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      aria-busy={loading}
      className={`neu-raised neu-press flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl text-sm font-bold tracking-wide text-accent transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      {loading ? (
        <>
          <Spinner />
          <span>Please wait</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
import { Monero } from "iconsax-react";

export default function Loding({ text = "Loading" }: { text?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-white/80 backdrop-blur-md dark:bg-slate-950/80"
    >
      {/* اللوجو + الحلقات */}
      <div className="relative flex h-28 w-28 items-center justify-center">
        {/* موجة بتتوسع وتختفي */}
        <span className="absolute inset-0 animate-ping rounded-full bg-indigo-500/20 motion-reduce:animate-none" />

        {/* حلقة خلفية ثابتة */}
        <span className="absolute inset-0 rounded-full border-4 border-indigo-500/15" />

        {/* حلقة بتلف */}
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-emerald-400 border-t-indigo-500 motion-reduce:animate-none" />

        {/* اللوجو بينبض */}
        <span className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-white shadow-lg shadow-indigo-500/20 motion-reduce:animate-none dark:bg-slate-900">
          <Monero size="36" color="#37d67a" variant="Bold" />
        </span>
      </div>

      {/* النص + نقط بتنط */}
      <div className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200">
        <span>{text}</span>
        <span className="flex items-end gap-1 pb-0.5" aria-hidden>
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 motion-reduce:animate-none" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:150ms] motion-reduce:animate-none" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:300ms] motion-reduce:animate-none" />
        </span>
      </div>
    </div>
  );
}
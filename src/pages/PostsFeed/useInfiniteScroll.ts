import { useEffect, useRef } from "react";

// بيرجّع ref تحطيه على عنصر في آخر القايمة، ولما يقرب من الشاشة بينادي onReach
export function useInfiniteScroll(onReach: () => void, enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const cbRef = useRef(onReach);

  useEffect(() => {
    cbRef.current = onReach;
  });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !enabled) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) cbRef.current();
      },
      { rootMargin: "400px" }, // يحمّل قبل ما توصلي للآخر بـ 400px
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  return sentinelRef;
}
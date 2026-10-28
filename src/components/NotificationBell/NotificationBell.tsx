import { Link, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Notification } from "iconsax-react";
import { getUnreadCountApi } from "../../pages/Notifications/notifications.api";

export function useUnreadCount() {
  return useQuery({
    queryKey: ["unreadCount"],
    queryFn: getUnreadCountApi,
    refetchInterval: 30_000, // تحديث كل 30 ثانية
    refetchOnWindowFocus: true,
  });
}

export default function NotificationBell() {
  const { data: count = 0 } = useUnreadCount();
  const { pathname } = useLocation();
  const active = pathname.startsWith("/notifications");

  return (
    <Link
      to="/notifications"
      aria-label={
        count > 0 ? `Notifications, ${count} unread` : "Notifications"
      }
      className={`relative me-3 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${
        active ? "bg-slate-200 dark:bg-slate-800" : ""
      }`}
    >
      <Notification
        size="26"
        variant={active ? "Bold" : "Outline"}
        color={active ? "#6366f1" : "currentColor"}
      />

      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-slate-400 dark:ring-[#091527]">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
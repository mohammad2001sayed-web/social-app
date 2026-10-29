import { Avatar } from "@heroui/react";
import { Link } from "react-router";

export default function UserList({
  users,
  isLoading,
  emptyText,
}: {
  users?: any[];
  isLoading: boolean;
  emptyText: string;
}) {
  if (isLoading) {
    return (
      <p className="py-10 text-center text-gray-500 dark:text-gray-400">
        Loading...
      </p>
    );
  }

  if (!users || users.length === 0) {
    return (
      <p className="py-10 text-center text-lg text-gray-500 dark:text-gray-400">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-gray-200 overflow-hidden bg-white md:rounded-2xl dark:divide-slate-800 dark:bg-[#18181B]">
      {users.map((u) => (
        <li key={u._id}>
          <Link
            to={`/user-posts/${u._id}`}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            <Avatar>
              <Avatar.Image src={u.photo} alt={u.name} />
              <Avatar.Fallback>
                {(u.name || "U").substring(0, 2).toUpperCase()}
              </Avatar.Fallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                {u.name}
              </p>
              {u.username && (
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  @{u.username}
                </p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
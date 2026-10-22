import { useMemo, useState } from "react";
import { Bell, X } from "lucide-react";
import { useListNotificationLogsQuery } from "@services/tenantadmin";
import { cn } from "@utils/cn";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  
  const { data, refetch } = useListNotificationLogsQuery(
    { limit: 10 },
    { 
      pollingInterval: 60000,
      skip: !open,
    },
  );

  const notifications = useMemo(() => data?.data ?? [], [data]);
  const unread = notifications.filter((n: any) => !n.readAt).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) refetch();
        }}
        className="relative rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-12 z-40 w-96 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-800">
                Notifications
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-500">
                  No notifications yet.
                </p>
              ) : (
                notifications.map((n: any) => (
                  <div
                    key={n.id}
                    className={cn(
                      "px-4 py-3",
                      !n.readAt && "bg-slate-50/70",
                    )}
                  >
                    <p className="text-sm font-medium text-slate-800">
                      {n.eventKey || n.templateId || "Notification"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                      {n.payload
                        ? JSON.stringify(n.payload).slice(0, 100)
                        : n.status || "Status"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {n.createdAt ? timeAgo(new Date(n.createdAt)) : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-slate-100 px-4 py-2 text-right">
              <button
                type="button"
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                View all
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
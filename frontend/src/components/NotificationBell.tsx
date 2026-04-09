import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle2, AlertCircle, Info, PartyPopper } from "lucide-react";
import type { Notification } from "@/data/matchData";

interface NotificationBellProps {
  notifications: Notification[];
}

const iconMap = {
  match: PartyPopper,
  review: AlertCircle,
  info: Info,
  welcome: CheckCircle2,
};

const iconColorMap = {
  match: "text-emerald-400",
  review: "text-amber-400",
  info: "text-blue-400",
  welcome: "text-purple-400",
};

export default function NotificationBell({ notifications }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifications);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-[#1A1A1A] transition-colors"
      >
        <Bell size={20} className="text-[#9CA3AF]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#E63946] rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
            <h3 className="font-bold text-sm">알림</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[#E63946] hover:text-[#FF4D5A] font-medium"
              >
                모두 읽음
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-8 text-center text-[#6B7280] text-sm">
                알림이 없습니다
              </div>
            ) : (
              items.map((n) => {
                const Icon = iconMap[n.type];
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 p-4 border-b border-[#2A2A2A]/50 hover:bg-[#222222] transition-colors ${
                      !n.read ? "bg-[#E63946]/5" : ""
                    }`}
                  >
                    <div className="mt-0.5">
                      <Icon size={18} className={iconColorMap[n.type]} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{n.title}</p>
                        {!n.read && (
                          <span className="w-2 h-2 bg-[#E63946] rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-[#4B5563] mt-1">{n.time}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
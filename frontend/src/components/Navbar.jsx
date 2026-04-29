import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Navbar() {
  const { user, logout } = useAuth();

  const name = user?.name || "Officer";
  const role = user?.role || "N/A";
  const initial = name.charAt(0)?.toUpperCase() || "O";

  const [notifOpen,    setNotifOpen]    = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [markingRead,  setMarkingRead]  = useState(false);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const res = await api.get("/notifications");
      const data = res?.data?.data;
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      setMarkingRead(true);
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch { /* silent */ } finally {
      setMarkingRead(false);
    }
  };

  const togglePanel = () => {
    if (!notifOpen) fetchNotifications();
    setNotifOpen((v) => !v);
  };

  // Click-outside to close
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  return (
    <header
      style={{ background: "var(--nav-bg)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      className="text-white px-6 py-3 flex justify-between items-center sticky top-0 z-50"
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg"
          style={{ boxShadow: "0 0 14px rgba(59,130,246,0.5)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <h1 className="font-bold text-sm leading-tight tracking-wide" style={{ color: "var(--text-primary)" }}>
            CCMS
          </h1>
          <p className="text-xs leading-tight" style={{ color: "var(--text-secondary)" }}>
            Crime &amp; Case Management
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={panelRef}>
          <button
            id="notif-bell-btn"
            onClick={togglePanel}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: notifOpen ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)" }}
            title="Notifications"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={notifOpen ? "#60a5fa" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span className="pulse-badge absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {/* Notification Panel */}
          {notifOpen && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl fade-in overflow-hidden"
              style={{
                background: "var(--card-bg)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                zIndex: 100,
              }}
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md font-bold" style={{ background: "rgba(239,68,68,0.2)", color: "#f87171" }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    disabled={markingRead}
                    className="text-xs font-medium transition-colors"
                    style={{ color: "#60a5fa", opacity: markingRead ? 0.5 : 1 }}
                  >
                    {markingRead ? "Marking…" : "Mark all read"}
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto" style={{ maxHeight: "320px" }}>
                {notifLoading ? (
                  <div className="p-4 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="shimmer h-10 rounded-xl" />
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>No notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.notification_id}
                      className="px-4 py-3 flex items-start gap-3 transition-colors"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: n.is_read ? "transparent" : "rgba(59,130,246,0.05)",
                      }}
                    >
                      <div className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0" style={{ background: n.is_read ? "rgba(100,116,139,0.3)" : "#60a5fa" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-relaxed" style={{ color: n.is_read ? "var(--text-secondary)" : "var(--text-primary)" }}>
                          {n.message}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>
                          {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6" style={{ background: "rgba(255,255,255,0.1)" }} />

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
              {name}
            </p>
            <p className="text-xs leading-tight" style={{ color: "var(--text-secondary)" }}>
              {role}
            </p>
          </div>

          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-sm shadow"
            style={{ boxShadow: "0 0 10px rgba(59,130,246,0.4)" }}>
            {initial}
          </div>

          <button
            onClick={() => { logout(); window.location.href = "/login"; }}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
            style={{ color: "#f87171", background: "rgba(248,113,113,0.08)" }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

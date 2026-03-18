import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, clearNotifications } = useNotification();
  const [open, setOpen] = useState(false);

  const name = user?.name || "Officer";
  const role = user?.role || "N/A";
  const initial = name.charAt(0)?.toUpperCase() || "O";

  return (
    <header className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center">
      <div>
        <h1 className="font-semibold text-lg">
          Crime & Case Management System
        </h1>
        <p className="text-xs text-gray-300">
          Government Law Enforcement Portal
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">
            {name}
          </p>
          <p className="text-xs text-gray-400">
            Role: {role}
          </p>
        </div>

        <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
          {initial}
        </div>

        <div className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="rounded border border-slate-600 px-2 py-1 text-xs"
          >
            Bell
          </button>

          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded">
              {notifications.length}
            </span>
          )}

          {open && (
            <div className="absolute right-0 mt-2 bg-white text-slate-800 shadow p-3 w-64 rounded z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold">Notifications</p>
                <button onClick={clearNotifications} className="text-xs text-blue-600">
                  Clear
                </button>
              </div>

              {notifications.length ? (
                notifications.map((item) => (
                  <p key={item.id} className="text-sm border-b py-1">
                    {item.message}
                  </p>
                ))
              ) : (
                <p className="text-sm text-slate-500">No notifications</p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className="text-xs text-red-400"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

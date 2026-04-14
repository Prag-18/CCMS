import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  const name = user?.name || "Officer";
  const role = user?.role || "N/A";
  const initial = name.charAt(0)?.toUpperCase() || "O";

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
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: "rgba(255,255,255,0.04)" }}
          title="Notifications"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="pulse-badge absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

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

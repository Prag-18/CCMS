import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canManageUsers } from "../utils/permissions";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    path: "/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    name: "Crimes",
    path: "/crimes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    name: "Cases",
    path: "/cases",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    name: "Map",
    path: "/map",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
        <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
      </svg>
    ),
    badge: "NEW",
  },
  {
    name: "Evidence",
    path: "/evidence",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
  {
    name: "Reports",
    path: "/reports",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
];

const ADMIN_ITEM = {
  name: "Manage Users",
  path: "/users",
  admin: true,
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
};

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const menu = [
    ...NAV_ITEMS,
    ...(canManageUsers(user?.role) ? [ADMIN_ITEM] : []),
  ];

  return (
    <aside
      style={{ background: "var(--sidebar-bg)", borderRight: "1px solid rgba(255,255,255,0.06)", minWidth: "220px", width: "220px" }}
      className="flex flex-col py-4"
    >
      {/* Section label */}
      <p className="px-5 mb-2 text-xs font-semibold uppercase tracking-widest"
        style={{ color: "rgba(148,163,184,0.5)" }}>
        Navigation
      </p>

      <nav className="flex flex-col gap-1 px-3">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive ? "active" : ""}`}
              style={{
                color: isActive ? "#60a5fa" : item.admin ? "#818cf8" : "var(--text-secondary)",
              }}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: "rgba(59,130,246,0.2)", color: "#60a5fa", fontSize: "10px" }}>
                  {item.badge}
                </span>
              )}
              {item.admin && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", fontSize: "10px" }}>
                  ADMIN
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom system status */}
      <div className="mt-auto mx-3 px-3 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.7)" }} />
          <span className="text-xs font-medium" style={{ color: "#34d399" }}>System Online</span>
        </div>
        <p className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>All services operational</p>
      </div>
    </aside>
  );
}

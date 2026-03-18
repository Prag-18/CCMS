import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canManageUsers } from "../utils/permissions";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const menu = [
    { name: "Dashboard", path: "/" },
    { name: "Crimes", path: "/crimes" },
    { name: "Cases", path: "/cases" },
    { name: "Reports", path: "/reports" },
    { name: "Evidence", path: "/evidence" },
    ...(canManageUsers(user?.role) ? [{ name: "Manage Users", path: "/users", admin: true }] : []),
  ];

  return (
    <aside className="w-64 bg-white border-r">
      <div className="p-4 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`block px-4 py-2 rounded-lg font-medium ${
              location.pathname === item.path
                ? "bg-blue-600 text-white"
                : item.admin
                  ? "text-blue-600 hover:bg-blue-50"
                  : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </aside>
  );
}

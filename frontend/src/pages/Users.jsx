import { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { handleUnauthorized } from "../utils/authError";

function extractItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

const ROLES = ["OFFICER", "INVESTIGATOR"];

const ROLE_COLORS = {
  ADMIN:        { bg: "rgba(239,68,68,0.15)",    text: "#f87171" },
  OFFICER:      { bg: "rgba(59,130,246,0.15)",   text: "#60a5fa" },
  INVESTIGATOR: { bg: "rgba(139,92,246,0.15)",   text: "#a78bfa" },
};

function roleBadge(role = "") {
  const c = ROLE_COLORS[role?.toUpperCase()] || { bg: "rgba(148,163,184,0.1)", text: "#94a3b8" };
  return (
    <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold"
      style={{ background: c.bg, color: c.text }}>
      {role}
    </span>
  );
}

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "var(--text-primary)",
  borderRadius: "12px",
  padding: "10px 14px",
  width: "100%",
  fontSize: "14px",
  outline: "none",
};
const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "var(--text-secondary)",
  marginBottom: "6px",
};

export default function Users() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm,   setShowForm]   = useState(false);
  const [search,     setSearch]     = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "OFFICER" });

  const fetchUsers = useCallback(async () => {
    try {
      setError("");
      const res = await api.get("/users");
      setUsers(extractItems(res?.data?.data));
    } catch (err) {
      if (handleUnauthorized(err)) return;
      setError(err?.response?.data?.message || "Failed to fetch users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true); setError("");
      await api.post("/auth/register", form);
      setForm({ name: "", email: "", password: "", role: "OFFICER" });
      setShowForm(false);
      await fetchUsers();
    } catch (err) {
      if (handleUnauthorized(err)) return;
      setError(err?.response?.data?.message || "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter((u) =>
    !search ||
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.role || "").toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name = "") => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  const avatarColor = (role = "") => {
    if (role === "ADMIN")        return { bg: "rgba(239,68,68,0.2)",  text: "#f87171" };
    if (role === "INVESTIGATOR") return { bg: "rgba(139,92,246,0.2)", text: "#a78bfa" };
    return { bg: "rgba(59,130,246,0.2)", text: "#60a5fa" };
  };

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              User Management
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {users.length} officers registered
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1.5 rounded-lg font-semibold"
              style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
              🛡 Admin Only
            </span>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {showForm
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>
                }
              </svg>
              {showForm ? "Cancel" : "Create User"}
            </button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4 fade-in">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(59,130,246,0.15)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Register New Officer</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Full Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Smith" required style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "rgba(59,130,246,0.5)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="officer@dept.gov" required style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "rgba(59,130,246,0.5)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" required style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "rgba(59,130,246,0.5)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }}>
                  {ROLES.map((r) => <option key={r} value={r} style={{ background: "#0b1120" }}>{r}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2"
              style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? (
                <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Creating…</>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Create User</>
              )}
            </button>
          </form>
        )}

        {/* Users Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="relative flex-1 max-w-xs">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users…" className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)" }} />
            </div>
            <span className="text-xs px-2 py-1 rounded-lg ml-auto"
              style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa" }}>
              {filtered.length} users
            </span>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer h-14 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No users found</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {filtered.map((item) => {
                const id = item.id || item.officerId || item.email;
                const av = avatarColor(item.role);
                return (
                  <div key={id} className="flex items-center gap-4 px-5 py-3.5 table-row-hover transition-colors">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: av.bg, color: av.text }}>
                      {initials(item.name)}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {item.name || "Unknown"}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                        {item.email || "—"}
                      </p>
                    </div>
                    {/* Role */}
                    <div className="flex-shrink-0">
                      {roleBadge(item.role)}
                    </div>
                    {/* ID */}
                    <p className="text-xs font-mono flex-shrink-0" style={{ color: "rgba(148,163,184,0.5)" }}>
                      #{item.id || item.officerId || "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

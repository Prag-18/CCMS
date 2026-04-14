import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import CrimeForm from "../components/CrimeForm";
import { handleUnauthorized } from "../utils/authError";
import { useAuth } from "../context/AuthContext";
import { canCreateCrime } from "../utils/permissions";

function extractItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

const TYPE_COLORS = {
  THEFT:     "#f59e0b", ASSAULT:  "#ef4444", ROBBERY:   "#f97316",
  FRAUD:     "#8b5cf6", MURDER:   "#dc2626", VANDALISM: "#06b6d4",
  DRUG:      "#10b981", BURGLARY: "#ec4899",
};
function typeColor(t = "") {
  return TYPE_COLORS[t.toUpperCase().split(" ")[0]] || "#3b82f6";
}

function Crimes() {
  const { user } = useAuth();
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchCrimes(); }, []);

  const fetchCrimes = async () => {
    try {
      setError("");
      const res = await api.get("/crimes");
      setCrimes(extractItems(res?.data?.data));
    } catch (err) {
      if (handleUnauthorized(err)) return;
      setError(err?.response?.data?.message || "Failed to fetch crimes.");
      setCrimes([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = crimes.filter((c) =>
    !search ||
    (c.crime_type || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Crimes</h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {crimes.length} total incidents recorded
            </p>
          </div>
          {canCreateCrime(user?.role) && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {showForm ? "Cancel" : "Register Crime"}
            </button>
          )}
        </div>

        {/* Permission warning */}
        {!canCreateCrime(user?.role) && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            You do not have permission to register crimes.
          </div>
        )}

        {/* Crime Form */}
        {showForm && canCreateCrime(user?.role) && (
          <div className="fade-in">
            <CrimeForm onCrimeAdded={() => { fetchCrimes(); setShowForm(false); }} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        {/* Search + Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="relative flex-1 max-w-xs">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search crimes…"
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa" }}>
              {filtered.length} results
            </span>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="shimmer h-10 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {search ? "No crimes match your search" : "No crimes recorded yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Type", "Description", "Location", "Reported"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-secondary)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((crime, i) => (
                    <tr
                      key={crime.crime_id || i}
                      className="table-row-hover transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={{ background: `${typeColor(crime.crime_type)}20`, color: typeColor(crime.crime_type) }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: typeColor(crime.crime_type) }} />
                          {crime.crime_type || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="truncate block" style={{ color: "var(--text-secondary)" }}>
                          {crime.description || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                        ID: {crime.location_id || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                        {crime.reported_at ? new Date(crime.reported_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Crimes;

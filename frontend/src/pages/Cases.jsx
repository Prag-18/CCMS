import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { handleUnauthorized } from "../utils/authError";
import { useAuth } from "../context/AuthContext";
import { canUpdateCase } from "../utils/permissions";
import CaseTimeline from "../components/CaseTimeline";

function extractItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

const STATUS_COLORS = {
  OPEN:          { bg: "rgba(251,191,36,0.15)",  text: "#fbbf24" },
  IN_PROGRESS:   { bg: "rgba(59,130,246,0.15)",  text: "#60a5fa" },
  CLOSED:        { bg: "rgba(52,211,153,0.15)",  text: "#34d399" },
  UNDER_INVESTIGATION: { bg: "rgba(139,92,246,0.15)", text: "#a78bfa" },
};
const PRIORITY_COLORS = {
  LOW:    { bg: "rgba(52,211,153,0.12)",  text: "#34d399" },
  MEDIUM: { bg: "rgba(251,191,36,0.12)",  text: "#fbbf24" },
  HIGH:   { bg: "rgba(239,68,68,0.12)",   text: "#f87171" },
};

function statusBadge(s = "") {
  const c = STATUS_COLORS[s?.toUpperCase()] || { bg: "rgba(148,163,184,0.1)", text: "#94a3b8" };
  return <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold" style={{ background: c.bg, color: c.text }}>{s || "—"}</span>;
}
function priorityBadge(p = "") {
  const c = PRIORITY_COLORS[p?.toUpperCase()] || { bg: "rgba(148,163,184,0.1)", text: "#94a3b8" };
  return <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold" style={{ background: c.bg, color: c.text }}>{p || "—"}</span>;
}

const selectStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "var(--text-primary)",
  borderRadius: "10px",
  padding: "6px 10px",
  fontSize: "12px",
  outline: "none",
  cursor: "pointer",
};

export default function Cases() {
  const { user } = useAuth();
  const [cases,   setCases]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [officers,              setOfficers]              = useState([]);
  const [updatingStatusCaseId,  setUpdatingStatusCaseId]  = useState(null);
  const [assigningCaseId,       setAssigningCaseId]       = useState(null);

  const [selectedCaseId,      setSelectedCaseId]      = useState(null);
  const [selectedCaseDetails, setSelectedCaseDetails] = useState(null);
  const [detailsLoading,      setDetailsLoading]      = useState(false);
  const [detailsError,        setDetailsError]        = useState("");

  const fetchCases = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError("");
      const res = await api.get("/cases");
      setCases(extractItems(res?.data?.data));
    } catch (err) {
      if (handleUnauthorized(err)) return;
      setError(err?.response?.data?.message || "Failed to fetch cases.");
      setCases([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  const fetchOfficers = useCallback(async () => {
    try {
      const res = await api.get("/auth/officers");
      setOfficers(extractItems(res?.data?.data));
    } catch (err) {
      if (handleUnauthorized(err)) return;
      setOfficers([]);
    }
  }, []);

  useEffect(() => { fetchCases(true); fetchOfficers(); }, [fetchCases, fetchOfficers]);

  const filteredCases = useMemo(() => {
    const q = search.toLowerCase().trim();
    return cases.filter((item) => {
      const searchable = `${item.caseNumber || ""} ${item.caseId || ""} ${item.title || ""}`.toLowerCase();
      return (q ? searchable.includes(q) : true)
        && (statusFilter   ? item.status   === statusFilter   : true)
        && (priorityFilter ? item.priority === priorityFilter : true);
    });
  }, [cases, search, statusFilter, priorityFilter]);

  const officerOptions = useMemo(() => {
    if (officers.length > 0) return officers;
    return Array.from(new Set(cases.map((c) => Number(c.assignedOfficerId)).filter((id) => id > 0)))
      .map((id) => ({ officerId: id, name: `Officer #${id}` }));
  }, [cases, officers]);

  const openCaseDetails = async (caseId) => {
    setSelectedCaseId(caseId); setDetailsLoading(true); setDetailsError("");
    try {
      const res = await api.get(`/cases/${caseId}`);
      setSelectedCaseDetails(res?.data?.data || null);
    } catch (err) {
      if (handleUnauthorized(err)) return;
      setDetailsError(err?.response?.data?.message || "Failed to fetch case details.");
      setSelectedCaseDetails(null);
    } finally { setDetailsLoading(false); }
  };

  const closeModal = () => { setSelectedCaseId(null); setSelectedCaseDetails(null); setDetailsError(""); };

  const refreshIfOpen = async (caseId) => {
    if (!selectedCaseId || Number(selectedCaseId) !== Number(caseId)) return;
    try { const res = await api.get(`/cases/${caseId}`); setSelectedCaseDetails(res?.data?.data || null); } catch { /* silent */ }
  };

  const closeCase = async (item) => {
    if (item.status === "CLOSED") return;
    try {
      setUpdatingStatusCaseId(item.caseId); setError("");
      await api.put(`/cases/${item.caseId}`, { status: "CLOSED", activityNote: "Status changed to CLOSED" });
      await fetchCases(false); await refreshIfOpen(item.caseId);
    } catch (err) {
      if (handleUnauthorized(err)) return;
      setError(err?.response?.data?.message || "Failed to update case.");
    } finally { setUpdatingStatusCaseId(null); }
  };

  const assignOfficer = async (caseId, officerId) => {
    const id = Number(officerId);
    if (!id || id <= 0) return;
    try {
      setAssigningCaseId(caseId); setError("");
      await api.put(`/cases/${caseId}`, { assignedOfficerId: id, activityNote: `Officer reassigned to #${id}` });
      await fetchCases(false); await refreshIfOpen(caseId);
    } catch (err) {
      if (handleUnauthorized(err)) return;
      setError(err?.response?.data?.message || "Failed to assign officer.");
    } finally { setAssigningCaseId(null); }
  };

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Case Management</h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {cases.length} total cases on record
            </p>
          </div>
          {user && (
            <button className="btn-primary flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Case
            </button>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="glass-card p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by case number or title…"
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)" }} />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="" style={{ background: "#0b1120" }}>All Statuses</option>
            <option value="OPEN" style={{ background: "#0b1120" }}>OPEN</option>
            <option value="IN_PROGRESS" style={{ background: "#0b1120" }}>IN PROGRESS</option>
            <option value="CLOSED" style={{ background: "#0b1120" }}>CLOSED</option>
          </select>

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={selectStyle}>
            <option value="" style={{ background: "#0b1120" }}>All Priorities</option>
            <option value="LOW"    style={{ background: "#0b1120" }}>LOW</option>
            <option value="MEDIUM" style={{ background: "#0b1120" }}>MEDIUM</option>
            <option value="HIGH"   style={{ background: "#0b1120" }}>HIGH</option>
          </select>

          <span className="text-xs px-2 py-1 rounded-lg ml-auto"
            style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa" }}>
            {filteredCases.length} results
          </span>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="shimmer h-12 rounded-xl" />)}
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No cases found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Case #", "Title", "Status", "Priority", "Officer", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-secondary)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((item) => (
                    <tr key={item.caseId} className="table-row-hover transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: "#60a5fa" }}>
                        {item.caseNumber}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="truncate block text-sm" style={{ color: "var(--text-primary)" }}>
                          {item.title || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{statusBadge(item.status)}</td>
                      <td className="px-4 py-3">{priorityBadge(item.priority)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={item.assignedOfficerId || ""}
                          onChange={(e) => assignOfficer(item.caseId, e.target.value)}
                          disabled={assigningCaseId === item.caseId}
                          style={{ ...selectStyle, opacity: assigningCaseId === item.caseId ? 0.5 : 1 }}
                        >
                          <option value="" disabled style={{ background: "#0b1120" }}>Select Officer</option>
                          {officerOptions.map((o) => (
                            <option key={o.officerId} value={o.officerId} style={{ background: "#0b1120" }}>
                              {o.name} (#{o.officerId})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openCaseDetails(item.caseId)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium"
                            style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
                            View
                          </button>
                          {canUpdateCase(user?.role) && (
                            <button
                              onClick={() => closeCase(item)}
                              disabled={item.status === "CLOSED" || updatingStatusCaseId === item.caseId}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                              style={{
                                background: item.status === "CLOSED" ? "rgba(52,211,153,0.08)" : "rgba(52,211,153,0.15)",
                                color: item.status === "CLOSED" ? "rgba(52,211,153,0.4)" : "#34d399",
                                border: "1px solid rgba(52,211,153,0.2)",
                                cursor: item.status === "CLOSED" ? "not-allowed" : "pointer",
                                opacity: updatingStatusCaseId === item.caseId ? 0.5 : 1,
                              }}>
                              {updatingStatusCaseId === item.caseId ? "…" : item.status === "CLOSED" ? "Closed" : "Close"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCaseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl fade-in"
            style={{ background: "var(--card-bg)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(59,130,246,0.15)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Case Details</h3>
                  {selectedCaseDetails && (
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{selectedCaseDetails.caseNumber}</p>
                  )}
                </div>
              </div>
              <button onClick={closeModal}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-5">
              {detailsLoading ? (
                <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer h-8 rounded-xl" />)}</div>
              ) : detailsError ? (
                <p className="text-sm text-red-400">{detailsError}</p>
              ) : selectedCaseDetails ? (
                <>
                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Case ID",         value: selectedCaseDetails.caseId },
                      { label: "Case Number",      value: selectedCaseDetails.caseNumber },
                      { label: "Title",            value: selectedCaseDetails.title || "—" },
                      { label: "Crime ID",         value: selectedCaseDetails.crimeId || "—" },
                      { label: "Status",           value: statusBadge(selectedCaseDetails.status) },
                      { label: "Priority",         value: priorityBadge(selectedCaseDetails.priority) },
                      { label: "Assigned Officer", value: selectedCaseDetails.assignedOfficerId ? `#${selectedCaseDetails.assignedOfficerId}` : "—" },
                      { label: "Station",          value: selectedCaseDetails.stationId || "—" },
                      { label: "Created",          value: selectedCaseDetails.createdAt ? new Date(selectedCaseDetails.createdAt).toLocaleString() : "—" },
                      { label: "Updated",          value: selectedCaseDetails.updatedAt ? new Date(selectedCaseDetails.updatedAt).toLocaleString() : "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "rgba(148,163,184,0.5)" }}>{label}</p>
                        <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  {/* Timeline */}
                  <CaseTimeline caseId={selectedCaseDetails.caseId} />
                </>
              ) : (
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No case details found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

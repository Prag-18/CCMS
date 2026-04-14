import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import EvidenceUploader from "../components/EvidenceUploader";
import { handleUnauthorized } from "../utils/authError";
import { useAuth } from "../context/AuthContext";
import { canUploadEvidence } from "../utils/permissions";

function extractItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

function formatEvidenceLabel(evidenceId) {
  return `EV-${String(evidenceId || "").padStart(6, "0")}`;
}

function normalizeEvidence(item) {
  return {
    raw: item,
    evidenceId:          item.evidenceId ?? item.evidence_id,
    caseId:              item.caseId ?? item.case_id,
    evidenceType:        item.evidenceType ?? item.type ?? item.evidence_type ?? "UNKNOWN",
    status:              item.status ?? "UNKNOWN",
    description:         item.description ?? "",
    location:            item.location ?? "",
    uploadedByOfficerId: item.uploadedByOfficerId ?? item.uploaded_by_officer_id ?? null,
    createdAt:           item.createdAt ?? item.created_at ?? null,
    fileName:            item.fileName ?? item.file_name ?? "",
    filePath:            item.filePath ?? item.file_path ?? "",
    mimeType:            item.mimeType ?? item.mime_type ?? "",
  };
}

function buildPreviewUrl(evidence) {
  if (!evidence?.filePath) return "";
  const file = String(evidence.filePath).replace(/\\/g, "/").split("/").pop();
  return file ? `http://localhost:5000/uploads/${encodeURIComponent(file)}` : "";
}

const TYPE_COLORS = {
  DOCUMENT: { bg: "rgba(59,130,246,0.15)",  text: "#60a5fa" },
  IMAGE:    { bg: "rgba(139,92,246,0.15)",   text: "#a78bfa" },
  VIDEO:    { bg: "rgba(244,63,94,0.15)",    text: "#fb7185" },
  AUDIO:    { bg: "rgba(52,211,153,0.15)",   text: "#34d399" },
  OTHER:    { bg: "rgba(148,163,184,0.12)",  text: "#94a3b8" },
};

const STATUS_COLORS = {
  PENDING:    { bg: "rgba(251,191,36,0.15)",  text: "#fbbf24" },
  PROCESSED:  { bg: "rgba(52,211,153,0.15)",  text: "#34d399" },
  SUBMITTED:  { bg: "rgba(59,130,246,0.15)",  text: "#60a5fa" },
  UNKNOWN:    { bg: "rgba(148,163,184,0.1)",  text: "#94a3b8" },
};

function typeBadge(type = "UNKNOWN") {
  const k = type.toUpperCase();
  const c = TYPE_COLORS[k] || TYPE_COLORS.OTHER;
  return <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold"
    style={{ background: c.bg, color: c.text }}>{type}</span>;
}

function statusBadge(status = "UNKNOWN") {
  const k = status.toUpperCase();
  const c = STATUS_COLORS[k] || STATUS_COLORS.UNKNOWN;
  return <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold"
    style={{ background: c.bg, color: c.text }}>{status}</span>;
}

export default function Evidence() {
  const { user }  = useAuth();
  const [evidence,        setEvidence]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState("");
  const [search,          setSearch]          = useState("");
  const [typeFilter,      setTypeFilter]      = useState("");
  const [statusFilter,    setStatusFilter]    = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [showUploader,    setShowUploader]    = useState(false);

  const fetchEvidence = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError("");
      const res = await api.get("/evidence");
      setEvidence(extractItems(res?.data?.data).map(normalizeEvidence));
    } catch (err) {
      if (handleUnauthorized(err)) return;
      setError(err?.response?.data?.message || "Failed to fetch evidence.");
      setEvidence([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvidence(true); }, [fetchEvidence]);

  const filteredEvidence = useMemo(() => {
    const q = search.trim().toLowerCase();
    return evidence.filter((item) => {
      const matchSearch = q
        ? `${item.evidenceId} ${item.description} ${item.fileName}`.toLowerCase().includes(q)
        : true;
      const matchType   = typeFilter   ? item.evidenceType === typeFilter   : true;
      const matchStatus = statusFilter ? item.status       === statusFilter : true;
      return matchSearch && matchType && matchStatus;
    });
  }, [evidence, search, typeFilter, statusFilter]);

  const availableTypes    = useMemo(() => [...new Set(evidence.map((i) => i.evidenceType).filter(Boolean))], [evidence]);
  const availableStatuses = useMemo(() => [...new Set(evidence.map((i) => i.status).filter(Boolean))],       [evidence]);

  const sel = selectedEvidence;
  const previewUrl  = sel ? buildPreviewUrl(sel) : "";
  const isImage     = sel?.mimeType?.startsWith("image/");
  const isVideo     = sel?.mimeType?.startsWith("video/");
  const canUpload   = canUploadEvidence(user?.role);

  const selectStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "var(--text-primary)",
    borderRadius: "12px",
    padding: "8px 12px",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
  };

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Evidence Management</h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {evidence.length} items in the evidence locker
            </p>
          </div>
          {canUpload ? (
            <button onClick={() => setShowUploader(!showUploader)} className="btn-primary flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {showUploader
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>
                }
              </svg>
              {showUploader ? "Cancel" : "Upload Evidence"}
            </button>
          ) : (
            <span className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(148,163,184,0.1)", color: "var(--text-secondary)" }}>
              Read-only (Investigator)
            </span>
          )}
        </div>

        {/* Uploader */}
        {showUploader && canUpload && (
          <div className="fade-in">
            <EvidenceUploader onUpload={() => { fetchEvidence(false); setShowUploader(false); }} />
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        {/* Filters + Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 flex flex-wrap items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Search */}
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search evidence…"
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)" }} />
            </div>

            {/* Type filter */}
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
              <option value="" style={{ background: "#0b1120" }}>All Types</option>
              {availableTypes.map((t) => <option key={t} value={t} style={{ background: "#0b1120" }}>{t}</option>)}
            </select>

            {/* Status filter */}
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
              <option value="" style={{ background: "#0b1120" }}>All Statuses</option>
              {availableStatuses.map((s) => <option key={s} value={s} style={{ background: "#0b1120" }}>{s}</option>)}
            </select>

            <span className="text-xs px-2 py-1 rounded-lg ml-auto"
              style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa" }}>
              {filteredEvidence.length} results
            </span>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer h-14 rounded-xl" />)}
            </div>
          ) : filteredEvidence.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No evidence found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["ID", "Type", "Case", "Description", "Status", "Uploaded", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-secondary)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEvidence.map((item) => (
                    <tr key={item.evidenceId} className="table-row-hover transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: "#60a5fa" }}>
                        {formatEvidenceLabel(item.evidenceId)}
                      </td>
                      <td className="px-4 py-3">{typeBadge(item.evidenceType)}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                        #{item.caseId || "—"}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="truncate block text-xs" style={{ color: "var(--text-secondary)" }}>
                          {item.description || item.fileName || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{statusBadge(item.status)}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedEvidence(item)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                            style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
                            View
                          </button>
                          {user?.role !== "INVESTIGATOR" && (
                            <button onClick={() => setError("Delete not implemented yet.")}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                              Delete
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
      {sel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => e.target === e.currentTarget && setSelectedEvidence(null)}>
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl fade-in"
            style={{ background: "var(--card-bg)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}>
            {/* Modal header */}
            <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(139,92,246,0.15)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                    Evidence Details — {formatEvidenceLabel(sel.evidenceId)}
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Case #{sel.caseId}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEvidence(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-5 p-5">
              {/* Preview */}
              <div className="rounded-xl overflow-hidden flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", minHeight: "200px" }}>
                {previewUrl ? (
                  isImage ? (
                    <img src={previewUrl} alt={sel.fileName || "evidence"} className="max-h-64 rounded-xl object-contain" />
                  ) : isVideo ? (
                    <video src={previewUrl} controls className="max-h-64 w-full rounded-xl" />
                  ) : (
                    <a href={previewUrl} target="_blank" rel="noreferrer"
                      className="flex flex-col items-center gap-2 p-4 text-center"
                      style={{ color: "#60a5fa" }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span className="text-sm">Open File</span>
                    </a>
                  )
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center p-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Preview not available</p>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="space-y-3">
                {[
                  { label: "Evidence ID",   value: formatEvidenceLabel(sel.evidenceId) },
                  { label: "Case",          value: `#${sel.caseId || "—"}` },
                  { label: "Officer",       value: sel.uploadedByOfficerId ? `#${sel.uploadedByOfficerId}` : "—" },
                  { label: "Type",          value: sel.evidenceType },
                  { label: "Status",        value: sel.status },
                  { label: "Location",      value: sel.location || "—" },
                  { label: "File",          value: sel.fileName || "—" },
                  { label: "Uploaded",      value: sel.createdAt ? new Date(sel.createdAt).toLocaleString() : "—" },
                  { label: "Description",   value: sel.description || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-xs uppercase tracking-wider font-semibold"
                      style={{ color: "rgba(148,163,184,0.5)" }}>{label}</span>
                    <span className="text-sm" style={{ color: "var(--text-primary)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

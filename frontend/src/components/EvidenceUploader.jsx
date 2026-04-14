import { useState } from "react";
import api from "../services/api";
import { handleUnauthorized } from "../utils/authError";

const EVIDENCE_TYPES = ["DOCUMENT", "IMAGE", "VIDEO", "AUDIO", "OTHER"];

const TYPE_ICONS = {
  DOCUMENT: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  IMAGE: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  VIDEO: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  ),
  AUDIO: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  OTHER: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

export default function EvidenceUploader({ onUpload, onUploaded }) {
  const [caseId, setCaseId]           = useState("");
  const [evidenceType, setEvidenceType] = useState("DOCUMENT");
  const [description, setDescription] = useState("");
  const [file, setFile]               = useState(null);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");
  const [dragOver, setDragOver]       = useState(false);

  const upload = async () => {
    if (!file)   { setError("Please choose a file first."); return; }
    if (!caseId) { setError("Case ID is required.");        return; }

    try {
      setSubmitting(true); setError("");
      const data = new FormData();
      data.append("file", file);
      data.append("caseId", caseId);
      data.append("evidenceType", evidenceType);
      data.append("description", description);
      await api.post("/evidence", data);
      setCaseId(""); setEvidenceType("DOCUMENT"); setDescription(""); setFile(null);
      const cb = onUpload || onUploaded;
      if (typeof cb === "function") await cb();
    } catch (err) {
      if (handleUnauthorized(err)) return;
      setError(err?.response?.data?.message || "Failed to upload evidence.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "var(--text-primary)",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
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

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(139,92,246,0.15)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Upload Evidence</h3>
      </div>

      {error && (
        <div className="px-3 py-2.5 rounded-xl text-xs"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Case ID */}
        <div>
          <label style={labelStyle}>Case ID</label>
          <input type="number" min="1" value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            placeholder="e.g. 12" style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = "rgba(59,130,246,0.5)"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
        </div>

        {/* Evidence Type */}
        <div>
          <label style={labelStyle}>Evidence Type</label>
          <select value={evidenceType} onChange={(e) => setEvidenceType(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}>
            {EVIDENCE_TYPES.map((t) => (
              <option key={t} value={t} style={{ background: "#0b1120" }}>{t}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional note" style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = "rgba(59,130,246,0.5)"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
        </div>
      </div>

      {/* Drop zone */}
      <div>
        <label style={labelStyle}>File</label>
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files?.[0] || null); }}
          className="flex flex-col items-center justify-center gap-2 rounded-xl p-6 cursor-pointer transition-all"
          style={{
            border: `2px dashed ${dragOver ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.1)"}`,
            background: dragOver ? "rgba(139,92,246,0.07)" : "rgba(255,255,255,0.02)",
          }}
        >
          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.12)" }}>
            {evidenceType && TYPE_ICONS[evidenceType] ? TYPE_ICONS[evidenceType] : TYPE_ICONS.OTHER}
          </div>
          {file ? (
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: "#a78bfa" }}>{file.name}</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Drop file here or <span style={{ color: "#a78bfa" }}>browse</span>
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.4)" }}>
                Images, videos, documents, audio
              </p>
            </div>
          )}
        </label>
      </div>

      <button onClick={upload} disabled={submitting}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
        style={{
          background: submitting ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
          color: "white",
          boxShadow: submitting ? "none" : "0 0 16px rgba(139,92,246,0.35)",
          cursor: submitting ? "not-allowed" : "pointer",
          border: "none",
        }}>
        {submitting ? (
          <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Uploading…</>
        ) : (
          <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Upload Evidence</>
        )}
      </button>
    </div>
  );
}

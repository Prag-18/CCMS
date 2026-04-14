import { useState } from "react";
import api from "../services/api";
import { handleUnauthorized } from "../utils/authError";

const CRIME_TYPES = ["THEFT", "ASSAULT", "ROBBERY", "FRAUD", "MURDER", "VANDALISM", "DRUG", "BURGLARY", "OTHER"];

export default function CrimeForm({ onCrimeAdded }) {
  const [crimeType, setCrimeType]   = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await api.post("/crimes", {
        crime_type: crimeType,
        description,
        location_id: Number(location),
      });
      setCrimeType("");
      setDescription("");
      setLocation("");
      if (typeof onCrimeAdded === "function") await onCrimeAdded();
    } catch (err) {
      if (handleUnauthorized(err)) return;
      setError(err?.response?.data?.message || "Failed to register crime.");
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

  return (
    <form onSubmit={submit} className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.15)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Register New Crime</h3>
      </div>

      {error && (
        <div className="px-3 py-2.5 rounded-xl text-xs"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Crime Type */}
        <div>
          <label style={labelStyle}>Crime Type</label>
          <select
            value={crimeType}
            onChange={(e) => setCrimeType(e.target.value)}
            required
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="" style={{ background: "#0b1120" }}>Select type…</option>
            {CRIME_TYPES.map((t) => (
              <option key={t} value={t} style={{ background: "#0b1120" }}>{t}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label style={labelStyle}>Location ID</label>
          <input
            type="number"
            min="1"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. 3"
            required
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = "rgba(59,130,246,0.5)"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the incident…"
          rows={3}
          required
          style={{ ...inputStyle, resize: "vertical", lineHeight: "1.5" }}
          onFocus={(e) => e.target.style.borderColor = "rgba(59,130,246,0.5)"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary flex items-center gap-2"
        style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
      >
        {submitting ? (
          <>
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Registering…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Register Crime
          </>
        )}
      </button>
    </form>
  );
}

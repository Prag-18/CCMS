import { useEffect, useState } from "react";
import api from "../services/api";
import { handleUnauthorized } from "../utils/authError";

function extractItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

const ACTIVITY_COLORS = {
  CASE_CREATED:        "#3b82f6",
  CASE_UPDATED:        "#f59e0b",
  CASE_CLOSED:         "#10b981",
  EVIDENCE_UPLOADED:   "#8b5cf6",
  OFFICER_ASSIGNED:    "#06b6d4",
  STATUS_CHANGED:      "#f43f5e",
};

export default function CaseTimeline({ caseId }) {
  const [timeline, setTimeline] = useState([]);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        setLoading(true); setError("");
        const res = await api.get(`/cases/${caseId}/timeline`);
        if (mounted) setTimeline(extractItems(res?.data?.data));
      } catch (err) {
        if (handleUnauthorized(err)) return;
        if (mounted) { setError(err?.response?.data?.message || "Failed to load timeline."); setTimeline([]); }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (caseId) fetch(); else setLoading(false);
    return () => { mounted = false; };
  }, [caseId]);

  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Case Timeline</h3>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="shimmer h-12 rounded-xl" />)}
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="relative">
          {timeline.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>No activity yet.</p>
          ) : (
            <div className="space-y-0">
              {timeline.map((item, idx) => {
                const color = ACTIVITY_COLORS[item.activityType] || "#64748b";
                const isLast = idx === timeline.length - 1;
                return (
                  <div key={item.caseActivityId} className="flex gap-3">
                    {/* Dot + line */}
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ background: color, boxShadow: `0 0 6px ${color}80` }} />
                      {!isLast && <div className="w-px flex-1 my-1" style={{ background: "rgba(255,255,255,0.08)" }} />}
                    </div>
                    <div className="pb-4 min-w-0">
                      <p className="text-xs font-semibold" style={{ color }}>{item.activityType}</p>
                      {item.notes && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{item.notes}</p>
                      )}
                      <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.4)" }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}
                        {item.actorOfficerId ? ` · Officer #${item.actorOfficerId}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

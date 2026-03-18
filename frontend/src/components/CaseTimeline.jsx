import { useEffect, useState } from "react";
import api from "../services/api";
import { handleUnauthorized } from "../utils/authError";

function extractItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function CaseTimeline({ caseId }) {
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTimeline = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/cases/${caseId}/timeline`);
        if (isMounted) {
          setTimeline(extractItems(res?.data?.data));
        }
      } catch (err) {
        if (handleUnauthorized(err)) {
          return;
        }

        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load timeline.");
          setTimeline([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (caseId) {
      fetchTimeline();
    } else {
      setLoading(false);
      setTimeline([]);
    }

    return () => {
      isMounted = false;
    };
  }, [caseId]);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <h3 className="font-semibold mb-4">Case Timeline</h3>

      {loading ? <p className="text-sm text-slate-500">Loading timeline...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !error ? (
        <div className="space-y-4">
          {timeline.map((item) => (
            <div key={item.caseActivityId} className="border-l-4 border-blue-500 pl-3">
              <p className="font-medium">{item.activityType}</p>
              <p className="text-sm text-gray-500">{item.notes}</p>
              <p className="text-xs text-gray-400">
                {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
              </p>
            </div>
          ))}

          {!timeline.length ? (
            <p className="text-sm text-slate-500">No activity available.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

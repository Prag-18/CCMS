import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { handleUnauthorized } from "../../utils/authError";

ChartJS.register(ArcElement, Tooltip, Legend);

function extractItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function CaseStatusChart() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchCases = async () => {
      try {
        setError("");
        const res = await api.get("/cases");
        const cases = extractItems(res?.data?.data);

        const counts = cases.reduce((acc, item) => {
          const status = String(item?.status || "UNKNOWN").toUpperCase();
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        if (isMounted) {
          setData({
            labels: Object.keys(counts),
            datasets: [
              {
                data: Object.values(counts),
                backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
              },
            ],
          });
        }
      } catch (err) {
        if (handleUnauthorized(err)) {
          return;
        }

        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load case status chart.");
          setData({
            labels: [],
            datasets: [
              {
                data: [],
                backgroundColor: ["#3b82f6"],
              },
            ],
          });
        }
      }
    };

    fetchCases();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!data) return <div className="bg-white p-6 rounded-xl shadow-sm">Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="font-semibold mb-4">Case Status Distribution</h3>
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      {data.labels.length ? <Doughnut data={data} /> : <p className="text-sm text-slate-500">No case data available.</p>}
    </div>
  );
}


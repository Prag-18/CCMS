import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { handleUnauthorized } from "../../utils/authError";

ChartJS.register(ArcElement, Tooltip, Legend);

function extractItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function CrimeTypePieChart() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchCrimes = async () => {
      try {
        setError("");
        const res = await api.get("/crimes");
        const crimes = extractItems(res?.data?.data);

        const counts = crimes.reduce((acc, crime) => {
          const type = crime?.crime_type || "UNKNOWN";
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        if (isMounted) {
          setData({
            labels: Object.keys(counts),
            datasets: [
              {
                data: Object.values(counts),
                backgroundColor: [
                  "#3b82f6",
                  "#ef4444",
                  "#f59e0b",
                  "#8b5cf6",
                  "#6b7280",
                  "#14b8a6",
                ],
              },
            ],
          });
        }
      } catch (err) {
        if (handleUnauthorized(err)) {
          return;
        }

        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load crime chart.");
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

    fetchCrimes();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!data) return <div className="bg-white p-6 rounded-xl shadow-sm">Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="font-semibold mb-4">Crime Type Distribution</h3>
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      {data.labels.length ? <Pie data={data} /> : <p className="text-sm text-slate-500">No crime data available.</p>}
    </div>
  );
}


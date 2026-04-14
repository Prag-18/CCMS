import { useEffect, useState } from "react";
import api from "../../services/api";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { handleUnauthorized } from "../../utils/authError";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLOR_PALETTE = [
  "#3b82f6", "#ef4444", "#f59e0b", "#10b981",
  "#8b5cf6", "#06b6d4", "#f43f5e", "#a3e635",
];

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
          const values = Object.values(counts);
          setData({
            labels: Object.keys(counts),
            datasets: [{
              data: values,
              backgroundColor: values.map((_, i) => COLOR_PALETTE[i % COLOR_PALETTE.length]),
              borderColor: "rgba(0,0,0,0.3)",
              borderWidth: 2,
            }],
          });
        }
      } catch (err) {
        if (handleUnauthorized(err)) return;
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load crime chart.");
          setData({ labels: [], datasets: [{ data: [], backgroundColor: [] }] });
        }
      }
    };

    fetchCrimes();
    return () => { isMounted = false; };
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#94a3b8", boxWidth: 12, padding: 12, font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: "#0d1526",
        borderColor: "rgba(59,130,246,0.3)",
        borderWidth: 1,
        titleColor: "#f1f5f9",
        bodyColor: "#94a3b8",
        padding: 10,
      },
    },
  };

  return (
    <div className="glass-card p-5" style={{ height: "320px" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
          Crime Type Distribution
        </h3>
      </div>
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      {!data ? (
        <div className="shimmer rounded-xl" style={{ height: "230px" }} />
      ) : data.labels.length ? (
        <div style={{ height: "240px" }}>
          <Pie data={data} options={options} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-48">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No crime data available.</p>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import api from "../../services/api";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { handleUnauthorized } from "../../utils/authError";

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_COLORS = {
  OPEN: "#f59e0b",
  CLOSED: "#10b981",
  PENDING: "#3b82f6",
  UNDER_INVESTIGATION: "#8b5cf6",
  UNKNOWN: "#64748b",
};

function extractItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function CaseStatusChart() {
  const [data, setData] = useState(null);
  const [counts, setCounts] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchCases = async () => {
      try {
        setError("");
        const res = await api.get("/cases");
        const cases = extractItems(res?.data?.data);

        const grouped = cases.reduce((acc, item) => {
          const status = String(item?.status || "UNKNOWN").toUpperCase();
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        if (isMounted) {
          setCounts(grouped);
          const labels = Object.keys(grouped);
          const values = Object.values(grouped);
          setData({
            labels,
            datasets: [{
              data: values,
              backgroundColor: labels.map((l) => STATUS_COLORS[l] || "#64748b"),
              borderColor: "rgba(0,0,0,0.25)",
              borderWidth: 2,
              hoverOffset: 6,
            }],
          });
        }
      } catch (err) {
        if (handleUnauthorized(err)) return;
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load chart.");
          setData({ labels: [], datasets: [{ data: [], backgroundColor: [] }] });
        }
      }
    };

    fetchCases();
    return () => { isMounted = false; };
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "right",
        labels: { color: "#94a3b8", boxWidth: 12, padding: 14, font: { size: 11 } },
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

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="glass-card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
          Case Status Breakdown
        </h3>
        {total > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
            {total} total
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      {!data ? (
        <div className="shimmer rounded-xl" style={{ height: "200px" }} />
      ) : data.labels.length ? (
        <div className="relative" style={{ height: "220px" }}>
          <Doughnut data={data} options={options} />
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{total}</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Cases</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-48">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No case data available.</p>
        </div>
      )}

      {/* Legend pills */}
      {data?.labels?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {data.labels.map((label, i) => (
            <div key={label} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: data.datasets[0].backgroundColor[i] }} />
              <span style={{ color: "var(--text-secondary)" }}>{label}</span>
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {data.datasets[0].data[i]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

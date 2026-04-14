import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { handleUnauthorized } from "../../utils/authError";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function extractItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function CasesByMonthChart() {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchCases = async () => {
      try {
        setError("");
        const res = await api.get("/cases");
        const cases = extractItems(res?.data?.data);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthCount = new Array(12).fill(0);

        cases.forEach((item) => {
          const date = new Date(item?.createdAt);
          if (!Number.isNaN(date.getTime())) {
            monthCount[date.getMonth()] += 1;
          }
        });

        if (isMounted) {
          setChartData({
            labels: months,
            datasets: [
              {
                label: "Cases",
                data: monthCount,
                backgroundColor: "rgba(59,130,246,0.75)",
                hoverBackgroundColor: "rgba(96,165,250,0.9)",
                borderRadius: 6,
                borderSkipped: false,
              },
            ],
          });
        }
      } catch (err) {
        if (handleUnauthorized(err)) return;
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load chart.");
          setChartData({ labels: ["No data"], datasets: [{ label: "Cases", data: [0], backgroundColor: "rgba(59,130,246,0.4)", borderRadius: 6 }] });
        }
      }
    };

    fetchCases();
    return () => { isMounted = false; };
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0d1526",
        borderColor: "rgba(59,130,246,0.3)",
        borderWidth: 1,
        titleColor: "#f1f5f9",
        bodyColor: "#94a3b8",
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#64748b", font: { size: 11 } },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#64748b", font: { size: 11 }, stepSize: 1 },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="glass-card p-5" style={{ height: "320px" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
          Cases by Month
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
          This Year
        </span>
      </div>
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      {chartData ? (
        <div style={{ height: "230px" }}>
          <Bar data={chartData} options={options} />
        </div>
      ) : (
        <div className="shimmer rounded-xl" style={{ height: "230px" }} />
      )}
    </div>
  );
}

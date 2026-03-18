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
                backgroundColor: "#3b82f6",
                borderRadius: 6,
              },
            ],
          });
        }
      } catch (err) {
        if (handleUnauthorized(err)) {
          return;
        }

        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load monthly case chart.");
          setChartData({
            labels: ["No data"],
            datasets: [
              {
                label: "Cases",
                data: [0],
                backgroundColor: "#3b82f6",
                borderRadius: 6,
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

  if (!chartData) return <div className="bg-white p-6 rounded-xl shadow-sm">Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="font-semibold mb-4">Cases by Month</h3>
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      <Bar data={chartData} />
    </div>
  );
}


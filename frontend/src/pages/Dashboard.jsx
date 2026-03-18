import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import CasesByMonthChart from "../components/charts/CasesByMonthChart";
import CrimeTypePieChart from "../components/charts/CrimeTypePieChart";
import CaseStatusChart from "../components/charts/CaseStatusChart";
import { handleUnauthorized } from "../utils/authError";

function extractItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    cases: 0,
    crimes: 0,
    open: 0,
    closed: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const [casesRes, crimesRes] = await Promise.all([
          api.get("/cases"),
          api.get("/crimes"),
        ]);
        const activityRes = await api.get("/cases/timeline/recent?limit=5");

        const cases = extractItems(casesRes?.data?.data);
        const crimes = extractItems(crimesRes?.data?.data);
        const activity = extractItems(activityRes?.data?.data);

        const open = cases.filter((item) => String(item.status || "").toUpperCase() === "OPEN").length;
        const closed = cases.filter((item) => String(item.status || "").toUpperCase() === "CLOSED").length;

        if (isMounted) {
          setStats({
            cases: cases.length,
            crimes: crimes.length,
            open,
            closed,
          });
          setRecentActivity(activity);
        }
      } catch (err) {
        if (handleUnauthorized(err)) {
          return;
        }

        if (isMounted) {
          setStats({
            cases: 0,
            crimes: 0,
            open: 0,
            closed: 0,
          });
          setRecentActivity([]);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Crimes" value={stats.crimes} />
        <StatCard title="Total Cases" value={stats.cases} />
        <StatCard title="Open Cases" value={stats.open} />
        <StatCard title="Closed Cases" value={stats.closed} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <CasesByMonthChart />
        <CrimeTypePieChart />
      </div>

      <div>
        <CaseStatusChart />
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm mt-6">
        <h3 className="font-semibold mb-4">
          Recent Activity
        </h3>

        <ul className="space-y-2 text-sm">
          {recentActivity.map((item) => (
            <li key={item.caseActivityId}>
              {item.caseNumber || `Case #${item.caseId}`} - {item.activityType}
            </li>
          ))}

          {!recentActivity.length ? (
            <>
              <li>Case activity will appear here</li>
            </>
          ) : null}
        </ul>
      </div>
    </Layout>
  );
}

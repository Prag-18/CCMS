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

const STAT_ICONS = {
  crimes: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  cases: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  open: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  closed: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
};

const STAT_GRADIENTS = {
  crimes: "rgba(239,68,68,0.15)",
  cases: "rgba(59,130,246,0.15)",
  open: "rgba(251,191,36,0.15)",
  closed: "rgba(52,211,153,0.15)",
};

const ACTIVITY_TYPE_COLORS = {
  CREATED: "text-blue-400",
  UPDATED: "text-yellow-400",
  CLOSED: "text-emerald-400",
  OPENED: "text-violet-400",
};

export default function Dashboard() {
  const [stats, setStats] = useState({ cases: 0, crimes: 0, open: 0, closed: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const [casesRes, crimesRes] = await Promise.all([
          api.get("/cases"),
          api.get("/crimes"),
        ]);
        const activityRes = await api.get("/cases/timeline/recent?limit=6");

        const cases = extractItems(casesRes?.data?.data);
        const crimes = extractItems(crimesRes?.data?.data);
        const activity = extractItems(activityRes?.data?.data);

        const open = cases.filter((item) => String(item.status || "").toUpperCase() === "OPEN").length;
        const closed = cases.filter((item) => String(item.status || "").toUpperCase() === "CLOSED").length;

        if (isMounted) {
          setStats({ cases: cases.length, crimes: crimes.length, open, closed });
          setRecentActivity(activity);
        }
      } catch (err) {
        if (handleUnauthorized(err)) return;
        if (isMounted) {
          setStats({ cases: 0, crimes: 0, open: 0, closed: 0 });
          setRecentActivity([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    return () => { isMounted = false; };
  }, []);

  const statCards = [
    { key: "crimes", title: "Total Crimes", value: stats.crimes },
    { key: "cases",  title: "Total Cases",  value: stats.cases  },
    { key: "open",   title: "Open Cases",   value: stats.open   },
    { key: "closed", title: "Closed Cases", value: stats.closed },
  ];

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Dashboard Overview
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Real-time crime &amp; case statistics
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
          style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #34d399" }} />
          Live Data
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="shimmer h-28 rounded-xl" />
            ))
          : statCards.map(({ key, title, value }) => (
              <StatCard
                key={key}
                title={title}
                value={value}
                icon={STAT_ICONS[key]}
                gradient={STAT_GRADIENTS[key]}
              />
            ))
        }
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <CasesByMonthChart />
        <CrimeTypePieChart />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Case Status Chart */}
        <div className="lg:col-span-3">
          <CaseStatusChart />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              Recent Activity
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-md"
              style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
              Latest 6
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="shimmer h-9 rounded-lg" />)}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-36 text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No activity yet</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {recentActivity.map((item) => {
                const colorClass = ACTIVITY_TYPE_COLORS[item.activityType] || "text-slate-400";
                return (
                  <li
                    key={item.caseActivityId}
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {item.caseNumber || `Case #${item.caseId}`}
                    </span>
                    <span className={`text-xs font-semibold ${colorClass}`}>
                      {item.activityType}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}

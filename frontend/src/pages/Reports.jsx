import { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import api from "../services/api";
import { handleUnauthorized } from "../utils/authError";

function extractItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

const REPORT_TEMPLATES = [
  {
    id: 1,
    title: "Monthly Crime Statistics",
    desc: "Breakdown of crimes reported this month by category and severity",
    type: "Statistical",
    typeColor: "#3b82f6",
    period: "Current Month",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
  },
  {
    id: 2,
    title: "Case Resolution Analysis",
    desc: "Closure rates, investigation timelines and officer efficiency metrics",
    type: "Performance",
    typeColor: "#10b981",
    period: "Overall",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  {
    id: 3,
    title: "Crime Hotspot Mapping",
    desc: "Geographic concentration of incidents across jurisdiction zones",
    type: "Geographic",
    typeColor: "#f59e0b",
    period: "Current Data",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
        <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
      </svg>
    ),
  },
  {
    id: 4,
    title: "Evidence Processing Report",
    desc: "Status of evidence intake, chain of custody and processing backlogs",
    type: "Operational",
    typeColor: "#8b5cf6",
    period: "Current Data",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
];

const STAT_ICONS = {
  reports: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  month:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  pending: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  crimes:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};

export default function Reports() {
  const [stats, setStats] = useState({ totalReports: 0, thisMonth: 0, pending: 0, scheduled: 0 });
  const [reports] = useState(REPORT_TEMPLATES);
  const [downloading, setDownloading] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [casesRes, crimesRes] = await Promise.all([api.get("/cases"), api.get("/crimes")]);
      const cases = extractItems(casesRes?.data?.data);
      const crimes = extractItems(crimesRes?.data?.data);
      const thisMonth = new Date().getMonth();
      const monthly = cases.filter((item) => {
        const d = new Date(item.createdAt);
        return !Number.isNaN(d.getTime()) && d.getMonth() === thisMonth;
      });
      setStats({
        totalReports: reports.length,
        thisMonth: monthly.length,
        pending: cases.filter((item) => item.status !== "CLOSED").length,
        scheduled: crimes.length,
      });
    } catch (err) {
      if (handleUnauthorized(err)) return;
      setStats({ totalReports: reports.length, thisMonth: 0, pending: 0, scheduled: 0 });
    }
  }, [reports.length]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const downloadReport = (report) => {
    setDownloading(report.id);
    setTimeout(() => {
      const content = `CCMS — ${report.title}\n${"=".repeat(50)}\nDescription: ${report.desc}\nPeriod: ${report.period}\nType: ${report.type}\nGenerated: ${new Date().toLocaleString()}\n\n[Data would be populated from live database]\n`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${report.title.replace(/\s+/g, "_")}.txt`; a.click();
      URL.revokeObjectURL(url);
      setDownloading(null);
    }, 600);
  };

  const statItems = [
    { key: "reports", title: "Report Templates", value: stats.totalReports, gradient: "rgba(59,130,246,0.15)" },
    { key: "month",   title: "Cases This Month", value: stats.thisMonth,    gradient: "rgba(52,211,153,0.15)" },
    { key: "pending", title: "Pending Review",   value: stats.pending,      gradient: "rgba(251,191,36,0.15)" },
    { key: "crimes",  title: "Total Crimes",     value: stats.scheduled,    gradient: "rgba(248,113,113,0.15)" },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Reports &amp; Analytics</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Generate and download operational reports</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Generate Report
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        {statItems.map(({ key, title, value, gradient }) => (
          <StatCard key={key} title={title} value={value} icon={STAT_ICONS[key]} gradient={gradient} />
        ))}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {reports.map((report) => (
          <div key={report.id} className="glass-card p-5 hover:scale-[1.01] transition-transform duration-200">
            {/* Card header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${report.typeColor}18` }}>
                {report.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-0.5" style={{ color: "var(--text-primary)" }}>
                  {report.title}
                </h3>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{report.desc}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold"
                style={{ background: `${report.typeColor}18`, color: report.typeColor }}>
                {report.type}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold"
                style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>
                ✓ Available
              </span>
              <span className="text-xs ml-auto" style={{ color: "var(--text-secondary)" }}>
                {report.period}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                onClick={() => downloadReport(report)}
                disabled={downloading === report.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: "rgba(59,130,246,0.15)",
                  color: "#60a5fa",
                  border: "1px solid rgba(59,130,246,0.2)",
                  opacity: downloading === report.id ? 0.6 : 1,
                  cursor: downloading === report.id ? "not-allowed" : "pointer",
                }}
              >
                {downloading === report.id ? (
                  <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                )}
                {downloading === report.id ? "Preparing…" : "Download"}
              </button>

              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--text-secondary)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

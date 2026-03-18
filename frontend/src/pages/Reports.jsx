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
    desc: "Breakdown of crimes reported this month",
    type: "Statistical",
    period: "Current Month",
  },
  {
    id: 2,
    title: "Case Resolution Analysis",
    desc: "Closure rates and investigation efficiency",
    type: "Performance",
    period: "Overall",
  },
  {
    id: 3,
    title: "Crime Hotspot Mapping",
    desc: "High-crime area analysis",
    type: "Geographic",
    period: "Current Data",
  },
  {
    id: 4,
    title: "Evidence Processing Report",
    desc: "Status of evidence handling",
    type: "Operational",
    period: "Current Data",
  },
];

export default function Reports() {
  const [stats, setStats] = useState({
    totalReports: 0,
    thisMonth: 0,
    pending: 0,
    scheduled: 0,
  });

  const [reports] = useState(REPORT_TEMPLATES);

  const fetchReportsData = useCallback(async () => {
    try {
      const [casesRes, crimesRes] = await Promise.all([
        api.get("/cases"),
        api.get("/crimes"),
      ]);

      const cases = extractItems(casesRes?.data?.data);
      const crimes = extractItems(crimesRes?.data?.data);
      const thisMonth = new Date().getMonth();

      const monthlyCases = cases.filter((item) => {
        const date = new Date(item.createdAt);
        return !Number.isNaN(date.getTime()) && date.getMonth() === thisMonth;
      });

      setStats({
        totalReports: reports.length,
        thisMonth: monthlyCases.length,
        pending: cases.filter((item) => item.status !== "CLOSED").length,
        scheduled: crimes.length,
      });
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }

      setStats({
        totalReports: reports.length,
        thisMonth: 0,
        pending: 0,
        scheduled: 0,
      });
    }
  }, [reports.length]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReportsData();
  }, [fetchReportsData]);

  const downloadReport = (report) => {
    const content = `
Report: ${report.title}

Description: ${report.desc}

Generated on: ${new Date().toLocaleString()}
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report.title}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Reports & Analytics</h2>
          <p className="text-gray-500 text-sm">Generate and download reports</p>
        </div>

        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">
          + Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Reports" value={stats.totalReports} />
        <StatCard title="This Month" value={stats.thisMonth} />
        <StatCard title="Pending Review" value={stats.pending} />
        <StatCard title="Scheduled" value={stats.scheduled} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {reports.map((report) => (
          <div key={report.id} className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="mb-2 font-semibold">{report.title}</h3>
            <p className="mb-3 text-sm text-gray-500">{report.desc}</p>

            <div className="mb-3 flex gap-2">
              <span className="rounded bg-gray-100 px-2 py-1 text-xs">{report.type}</span>
              <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-600">Available</span>
            </div>

            <p className="mb-4 text-sm">
              Period: <span className="font-medium">{report.period}</span>
            </p>

            <div className="flex gap-3">
              <button onClick={() => downloadReport(report)} className="rounded border px-3 py-1">
                Download
              </button>

              <button className="rounded border px-3 py-1">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

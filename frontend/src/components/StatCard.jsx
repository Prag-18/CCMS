export default function StatCard({ title, value, subtitle, icon, gradient, trend }) {
  return (
    <div
      className="stat-card-glow glass-card p-5 flex items-start justify-between hover:scale-[1.02] transition-transform duration-200 cursor-default"
      style={{ minHeight: "110px" }}
    >
      <div className="flex flex-col justify-between h-full">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)" }}>
          {title}
        </p>
        <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          {value ?? "—"}
        </p>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {subtitle}
          </p>
        )}
        {trend !== undefined && (
          <p className={`text-xs mt-1 font-medium ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs last month
          </p>
        )}
      </div>

      {icon && (
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: gradient || "rgba(59,130,246,0.15)",
            boxShadow: "0 0 14px rgba(59,130,246,0.2)",
          }}
        >
          {icon}
        </div>
      )}
    </div>
  );
}

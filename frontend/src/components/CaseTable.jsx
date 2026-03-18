export default function CaseTable({ items = [], cases = [] }) {
  const rows = Array.isArray(cases) && cases.length ? cases : items;

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        No cases found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3 font-semibold">Case Number</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Priority</th>
            <th className="px-4 py-3 font-semibold">Created</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((item) => (
            <tr key={item.caseId || item.caseNumber} className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-900">{item.caseNumber || "-"}</td>
              <td className="px-4 py-3 text-slate-700">{item.status || "-"}</td>
              <td className="px-4 py-3 text-slate-700">{item.priority || "-"}</td>
              <td className="px-4 py-3 text-slate-700">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

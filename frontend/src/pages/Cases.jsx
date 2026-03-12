import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CaseTable from "../components/CaseTable";

function Cases() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <main className="p-4 sm:p-6">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">Cases</h2>
            <CaseTable items={[]} />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Cases;

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import VictimForm from "../components/VictimForm";

function Victims() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <main className="p-4 sm:p-6">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">Victims</h2>
            <VictimForm />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Victims;

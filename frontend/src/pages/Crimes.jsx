import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CrimeForm from "../components/CrimeForm";

function Crimes() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <main className="p-4 sm:p-6">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">Crimes</h2>
            <CrimeForm />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Crimes;

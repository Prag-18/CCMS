import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function Map() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <main className="p-4 sm:p-6">
            <h2 className="text-2xl font-bold text-slate-900">Map</h2>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Map;

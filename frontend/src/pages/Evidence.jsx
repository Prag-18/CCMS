import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import EvidenceUploader from "../components/EvidenceUploader";

function Evidence() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between">

<div>

<h4 className="font-semibold">
EV-2024-0847
</h4>

<p className="text-gray-500 text-sm">
Security camera footage
</p>

</div>

<div>

<span className="bg-green-100 text-green-600 px-2 py-1 rounded">
Verified
</span>

</div>

</div>
  );
}

export default Evidence;

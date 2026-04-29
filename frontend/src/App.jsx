import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Crimes from "./pages/Crimes";
import Cases from "./pages/Cases";
import Victims from "./pages/Victims";
import Evidence from "./pages/Evidence";
import Map from "./pages/Map";
import Reports from "./pages/Reports";
import Users from "./pages/Users";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login is disabled — redirect to dashboard */}
        <Route path="/login" element={<Navigate to="/" replace />} />

        <Route path="/" element={<Dashboard />} />
        <Route path="/crimes" element={<Crimes />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/victims" element={<Victims />} />
        <Route path="/evidence" element={<Evidence />} />
        <Route path="/map" element={<Map />} />
        <Route path="/users" element={<Users />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

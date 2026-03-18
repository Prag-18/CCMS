import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Crimes from "./pages/Crimes";
import Cases from "./pages/Cases";
import Victims from "./pages/Victims";
import Evidence from "./pages/Evidence";
import Map from "./pages/Map";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import { useAuth } from "./context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== "ADMIN") return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
        <Route path="/crimes" element={<PrivateRoute><Crimes/></PrivateRoute>} />
        <Route path="/cases" element={<PrivateRoute><Cases/></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports/></PrivateRoute>} />
        <Route path="/victims" element={<PrivateRoute><Victims/></PrivateRoute>} />
        <Route path="/evidence" element={<PrivateRoute><Evidence/></PrivateRoute>} />
        <Route path="/map" element={<PrivateRoute><Map/></PrivateRoute>} />
        <Route path="/users" element={<AdminRoute><Users/></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

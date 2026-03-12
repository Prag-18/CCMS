import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Crimes from "./pages/Crimes";
import Cases from "./pages/Cases";
import Victims from "./pages/Victims";
import Evidence from "./pages/Evidence";
import Map from "./pages/Map";
import { useAuth } from "./context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();

  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
        <Route path="/crimes" element={<PrivateRoute><Crimes/></PrivateRoute>} />
        <Route path="/cases" element={<PrivateRoute><Cases/></PrivateRoute>} />
        <Route path="/victims" element={<PrivateRoute><Victims/></PrivateRoute>} />
        <Route path="/evidence" element={<PrivateRoute><Evidence/></PrivateRoute>} />
        <Route path="/map" element={<PrivateRoute><Map/></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res?.data?.data?.token;
      const officer = res?.data?.data?.officer;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(officer || {}));
        login({
          token,
          officer: officer || null,
        });
        navigate("/");
      } else {
        setError("Login failed. Token not received.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="grid w-full max-w-sm gap-3 rounded-xl border border-slate-200 bg-white p-5"
      >
        <h2 className="text-xl font-semibold text-slate-900">Login</h2>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
        />
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
        />
        <button className="rounded-md bg-slate-900 px-4 py-2 text-white" type="submit">
          Sign In
        </button>
      </form>
    </div>
  );
}

export default Login;

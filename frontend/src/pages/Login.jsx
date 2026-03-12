import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/auth/login", { email, password });
      const token = response?.data?.data?.token;

      if (token) {
        login(token);
        navigate("/");
      }
    } catch (_error) {
      // scaffold
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="grid w-full max-w-sm gap-3 rounded-xl border border-slate-200 bg-white p-5"
      >
        <h2 className="text-xl font-semibold text-slate-900">Login</h2>
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

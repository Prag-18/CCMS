import { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { handleUnauthorized } from "../utils/authError";

function extractItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "OFFICER",
  });

  const fetchUsers = useCallback(async () => {
    try {
      setError("");
      const res = await api.get("/users");
      setUsers(extractItems(res?.data?.data));
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }

      setError(err?.response?.data?.message || "Failed to fetch users.");
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      await api.post("/auth/register", form);

      setForm({
        name: "",
        email: "",
        password: "",
        role: "OFFICER",
      });

      await fetchUsers();
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }

      setError(err?.response?.data?.message || "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-6">
        User Management (Admin)
      </h2>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm mb-6 space-y-3">
        <input
          value={form.name}
          placeholder="Name"
          className="border p-2 w-full rounded"
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />

        <input
          value={form.email}
          placeholder="Email"
          type="email"
          className="border p-2 w-full rounded"
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />

        <input
          value={form.password}
          type="password"
          placeholder="Password"
          className="border p-2 w-full rounded"
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />

        <select
          value={form.role}
          className="border p-2 w-full rounded"
          onChange={(event) => setForm({ ...form, role: event.target.value })}
        >
          <option value="OFFICER">Officer</option>
          <option value="INVESTIGATOR">Investigator</option>
        </select>

        <button
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {submitting ? "Creating..." : "Create User"}
        </button>
      </form>

      <div className="bg-white p-5 rounded-xl shadow-sm space-y-3">
        {users.map((item) => (
          <div key={item.id || item.officerId || item.email} className="border-b py-2 flex justify-between">
            <span>{item.name} ({item.role})</span>
          </div>
        ))}

        {!users.length ? <p className="text-sm text-slate-500">No users found.</p> : null}
      </div>
    </Layout>
  );
}

import { useState } from "react";
import api from "../services/api";
import { handleUnauthorized } from "../utils/authError";

export default function VictimForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      await api.post("/victims", { fullName: name });
      setName("");
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }

      setError(err?.response?.data?.message || "Failed to add victim.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <input
        placeholder="Victim Name"
        className="border p-2"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <button className="bg-green-500 text-white p-2">
        Add Victim
      </button>
    </form>
  );
}

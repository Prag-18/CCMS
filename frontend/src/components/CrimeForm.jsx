import { useState } from "react";
import api from "../services/api";
import { handleUnauthorized } from "../utils/authError";
import { useNotification } from "../context/NotificationContext";

export default function CrimeForm({ onCrimeAdded }) {
  const { addNotification } = useNotification();
  const [crimeType, setCrimeType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      await api.post("/crimes", {
        crime_type: crimeType,
        description,
        location_id: Number(location),
      });
      addNotification("Crime created successfully");

      setCrimeType("");
      setDescription("");
      setLocation("");

      if (typeof onCrimeAdded === "function") {
        await onCrimeAdded();
      }
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }

      setError(err?.response?.data?.message || "Failed to register crime.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <input
        value={crimeType}
        placeholder="Crime Type"
        className="w-full rounded-lg border border-slate-300 p-2"
        onChange={(event) => setCrimeType(event.target.value)}
        required
      />

      <textarea
        value={description}
        placeholder="Description"
        className="w-full rounded-lg border border-slate-300 p-2"
        onChange={(event) => setDescription(event.target.value)}
        required
      />

      <input
        value={location}
        placeholder="Location ID"
        type="number"
        min="1"
        className="w-full rounded-lg border border-slate-300 p-2"
        onChange={(event) => setLocation(event.target.value)}
        required
      />

      <button
        className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-blue-300"
        disabled={submitting}
      >
        {submitting ? "Registering..." : "Register Crime"}
      </button>
    </form>
  );
}

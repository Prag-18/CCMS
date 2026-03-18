import { useState } from "react";
import api from "../services/api";
import { handleUnauthorized } from "../utils/authError";
import { useNotification } from "../context/NotificationContext";

export default function EvidenceUploader({ onUpload, onUploaded }) {
  const { addNotification } = useNotification();
  const [caseId, setCaseId] = useState("");
  const [evidenceType, setEvidenceType] = useState("DOCUMENT");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const upload = async () => {
    if (!file) {
      setError("Please choose a file first.");
      return;
    }

    if (!caseId) {
      setError("Case ID is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const data = new FormData();
      data.append("file", file);
      data.append("caseId", caseId);
      data.append("evidenceType", evidenceType);
      data.append("description", description);

      await api.post("/evidence", data);
      addNotification("Evidence uploaded successfully");

      setCaseId("");
      setEvidenceType("DOCUMENT");
      setDescription("");
      setFile(null);

      const refreshCb = onUpload || onUploaded;
      if (typeof refreshCb === "function") {
        await refreshCb();
      }
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }

      setError(err?.response?.data?.message || "Failed to upload evidence.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          type="number"
          min="1"
          value={caseId}
          onChange={(event) => setCaseId(event.target.value)}
          placeholder="Case ID"
          className="rounded-lg border border-slate-300 p-2"
        />

        <select
          value={evidenceType}
          onChange={(event) => setEvidenceType(event.target.value)}
          className="rounded-lg border border-slate-300 p-2"
        >
          <option value="DOCUMENT">DOCUMENT</option>
          <option value="IMAGE">IMAGE</option>
          <option value="VIDEO">VIDEO</option>
          <option value="AUDIO">AUDIO</option>
          <option value="OTHER">OTHER</option>
        </select>

        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description (optional)"
          className="rounded-lg border border-slate-300 p-2"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />

        <button
          onClick={upload}
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {submitting ? "Uploading..." : "Upload Evidence"}
        </button>
      </div>
    </div>
  );
}

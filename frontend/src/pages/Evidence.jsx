import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import EvidenceUploader from "../components/EvidenceUploader";
import { handleUnauthorized } from "../utils/authError";
import { useAuth } from "../context/AuthContext";
import { canUploadEvidence } from "../utils/permissions";

function extractItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

function formatEvidenceLabel(evidenceId) {
  const id = String(evidenceId || "").padStart(6, "0");
  return `EV-${id}`;
}

function normalizeEvidence(item) {
  const evidenceId = item.evidenceId ?? item.evidence_id;
  const caseId = item.caseId ?? item.case_id;
  const evidenceType = item.evidenceType ?? item.type ?? item.evidence_type ?? "UNKNOWN";
  const status = item.status ?? "UNKNOWN";
  const description = item.description ?? "";
  const location = item.location ?? "";
  const uploadedByOfficerId = item.uploadedByOfficerId ?? item.uploaded_by_officer_id ?? null;
  const createdAt = item.createdAt ?? item.created_at ?? null;
  const fileName = item.fileName ?? item.file_name ?? "";
  const filePath = item.filePath ?? item.file_path ?? "";
  const mimeType = item.mimeType ?? item.mime_type ?? "";

  return {
    raw: item,
    evidenceId,
    caseId,
    evidenceType,
    status,
    description,
    location,
    uploadedByOfficerId,
    createdAt,
    fileName,
    filePath,
    mimeType,
  };
}

function buildPreviewUrl(evidence) {
  if (!evidence?.filePath) return "";
  const normalized = String(evidence.filePath).replace(/\\/g, "/");
  const file = normalized.split("/").pop();
  if (!file) return "";
  return `http://localhost:5000/uploads/${encodeURIComponent(file)}`;
}

export default function Evidence() {
  const { user } = useAuth();
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  const fetchEvidence = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError("");
      const res = await api.get("/evidence");
      const normalized = extractItems(res?.data?.data).map(normalizeEvidence);
      setEvidence(normalized);
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }

      setError(err?.response?.data?.message || "Failed to fetch evidence.");
      setEvidence([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvidence(true);
  }, [fetchEvidence]);

  const filteredEvidence = useMemo(() => {
    const query = search.trim().toLowerCase();
    return evidence.filter((item) => {
      const matchesSearch = query
        ? `${item.evidenceId || ""} ${item.description || ""} ${item.fileName || ""}`.toLowerCase().includes(query)
        : true;
      const matchesType = typeFilter ? item.evidenceType === typeFilter : true;
      const matchesStatus = statusFilter ? item.status === statusFilter : true;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [evidence, search, statusFilter, typeFilter]);

  const availableTypes = useMemo(() => {
    return Array.from(new Set(evidence.map((item) => item.evidenceType).filter(Boolean)));
  }, [evidence]);

  const availableStatuses = useMemo(() => {
    return Array.from(new Set(evidence.map((item) => item.status).filter(Boolean)));
  }, [evidence]);

  const previewUrl = selectedEvidence ? buildPreviewUrl(selectedEvidence) : "";
  const previewMime = selectedEvidence?.mimeType || "";
  const isImage = previewMime.startsWith("image/");
  const isVideo = previewMime.startsWith("video/");
  const canUpload = canUploadEvidence(user?.role);

  const handleDeleteClick = () => {
    setError("Delete action is not implemented yet.");
  };

  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-6">Evidence Management</h2>

      {canUpload ? (
        <EvidenceUploader onUpload={() => fetchEvidence(false)} />
      ) : (
        <p className="text-gray-500 text-sm">
          Read-only access (Investigator)
        </p>
      )}

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 rounded-xl bg-white p-4 shadow-sm md:grid-cols-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search evidence..."
          className="rounded border border-slate-300 p-2"
        />

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className="rounded border border-slate-300 p-2"
        >
          <option value="">All Types</option>
          {availableTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded border border-slate-300 p-2"
        >
          <option value="">All Status</option>
          {availableStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? <p className="text-sm text-slate-500">Loading evidence...</p> : null}

        {!loading && filteredEvidence.length === 0 ? (
          <p className="text-sm text-slate-500">No evidence found.</p>
        ) : null}

        {filteredEvidence.map((item) => (
          <div
            key={item.evidenceId}
            className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-white p-4 shadow-sm"
          >
            <div>
              <h4 className="font-semibold">{formatEvidenceLabel(item.evidenceId)}</h4>
              <p className="text-sm text-slate-500">{item.description || item.fileName || "No description"}</p>
              <p className="mt-1 text-xs text-slate-500">
                Case #{item.caseId} | {item.evidenceType}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                {item.evidenceType}
              </span>
              <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                {item.status}
              </span>
              <button
                onClick={() => setSelectedEvidence(item)}
                className="rounded border border-slate-300 px-3 py-1 text-xs font-medium"
              >
                View Details
              </button>
              {user?.role !== "INVESTIGATOR" && (
                <button
                  onClick={handleDeleteClick}
                  className="rounded border border-red-300 px-3 py-1 text-xs font-medium text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedEvidence ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-xl font-semibold">
                Evidence Details - {formatEvidenceLabel(selectedEvidence.evidenceId)}
              </h3>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="rounded bg-slate-100 px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-3">
                <h4 className="mb-2 font-semibold">File Preview</h4>
                {previewUrl ? (
                  isImage ? (
                    <img src={previewUrl} alt={selectedEvidence.fileName || "evidence"} className="max-h-72 rounded" />
                  ) : isVideo ? (
                    <video src={previewUrl} controls className="max-h-72 w-full rounded" />
                  ) : (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 underline"
                    >
                      Open file
                    </a>
                  )
                ) : (
                  <p className="text-sm text-slate-500">Preview not available.</p>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 p-3 text-sm">
                <h4 className="mb-2 font-semibold">Meta</h4>
                <p><span className="font-semibold">Case:</span> #{selectedEvidence.caseId || "-"}</p>
                <p><span className="font-semibold">Officer:</span> {selectedEvidence.uploadedByOfficerId ? `#${selectedEvidence.uploadedByOfficerId}` : "-"}</p>
                <p><span className="font-semibold">Type:</span> {selectedEvidence.evidenceType}</p>
                <p><span className="font-semibold">Status:</span> {selectedEvidence.status}</p>
                <p><span className="font-semibold">Location:</span> {selectedEvidence.location || "-"}</p>
                <p><span className="font-semibold">Uploaded:</span> {selectedEvidence.createdAt ? new Date(selectedEvidence.createdAt).toLocaleString() : "-"}</p>
                <p><span className="font-semibold">File:</span> {selectedEvidence.fileName || "-"}</p>
                <p className="mt-2"><span className="font-semibold">Description:</span> {selectedEvidence.description || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { handleUnauthorized } from "../utils/authError";
import { useAuth } from "../context/AuthContext";
import { canUpdateCase } from "../utils/permissions";
import CaseTimeline from "../components/CaseTimeline";
import { useNotification } from "../context/NotificationContext";

function extractItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function Cases() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [officers, setOfficers] = useState([]);
  const [updatingStatusCaseId, setUpdatingStatusCaseId] = useState(null);
  const [assigningCaseId, setAssigningCaseId] = useState(null);

  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [selectedCaseDetails, setSelectedCaseDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const fetchCases = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError("");
      const res = await api.get("/cases");
      setCases(extractItems(res?.data?.data));
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }

      setError(err?.response?.data?.message || "Failed to fetch cases.");
      setCases([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  const fetchOfficers = useCallback(async () => {
    try {
      const res = await api.get("/auth/officers");
      setOfficers(extractItems(res?.data?.data));
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }

      setOfficers([]);
    }
  }, []);

  useEffect(() => {
    fetchCases(true);
    fetchOfficers();
  }, [fetchCases, fetchOfficers]);

  const filteredCases = useMemo(() => {
    const query = search.toLowerCase().trim();

    return cases.filter((item) => {
      const searchable = `${item.caseNumber || ""} ${item.caseId || ""} ${item.title || ""}`.toLowerCase();
      const matchesSearch = query ? searchable.includes(query) : true;
      const matchesStatus = statusFilter ? item.status === statusFilter : true;
      const matchesPriority = priorityFilter ? item.priority === priorityFilter : true;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [cases, priorityFilter, search, statusFilter]);

  const officerOptions = useMemo(() => {
    if (officers.length > 0) {
      return officers;
    }

    const discovered = Array.from(
      new Set(cases.map((item) => Number(item.assignedOfficerId)).filter((id) => Number.isFinite(id) && id > 0))
    );

    return discovered.map((id) => ({
      officerId: id,
      name: `Officer #${id}`,
      role: "",
    }));
  }, [cases, officers]);

  const openCaseDetails = async (caseId) => {
    setSelectedCaseId(caseId);
    setDetailsLoading(true);
    setDetailsError("");

    try {
      const res = await api.get(`/cases/${caseId}`);
      setSelectedCaseDetails(res?.data?.data || null);
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }

      setDetailsError(err?.response?.data?.message || "Failed to fetch case details.");
      setSelectedCaseDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetailsModal = () => {
    setSelectedCaseId(null);
    setSelectedCaseDetails(null);
    setDetailsError("");
    setDetailsLoading(false);
  };

  const refreshSelectedCaseIfOpen = async (caseId) => {
    if (!selectedCaseId || Number(selectedCaseId) !== Number(caseId)) {
      return;
    }

    try {
      const res = await api.get(`/cases/${caseId}`);
      setSelectedCaseDetails(res?.data?.data || null);
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }

      // Keep the existing modal content if the refresh fails.
    }
  };

  const closeCaseFromUi = async (item) => {
    if (item.status === "CLOSED") {
      return;
    }

    try {
      setUpdatingStatusCaseId(item.caseId);
      setError("");
      await api.put(`/cases/${item.caseId}`, {
        status: "CLOSED",
        activityNote: "Status changed to CLOSED from Cases UI",
      });
      addNotification(`Case ${item.caseNumber || item.caseId} updated`);

      await fetchCases(false);
      await refreshSelectedCaseIfOpen(item.caseId);
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }

      setError(err?.response?.data?.message || "Failed to update case status.");
    } finally {
      setUpdatingStatusCaseId(null);
    }
  };

  const assignOfficerFromUi = async (caseId, nextOfficerId) => {
    const parsedOfficerId = Number(nextOfficerId);
    if (!Number.isFinite(parsedOfficerId) || parsedOfficerId <= 0) {
      return;
    }

    try {
      setAssigningCaseId(caseId);
      setError("");
      await api.put(`/cases/${caseId}`, {
        assignedOfficerId: parsedOfficerId,
        activityNote: `Officer reassigned to ${parsedOfficerId} from Cases UI`,
      });
      addNotification(`Officer assigned to case ${caseId}`);

      await fetchCases(false);
      await refreshSelectedCaseIfOpen(caseId);
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }

      setError(err?.response?.data?.message || "Failed to assign officer.");
    } finally {
      setAssigningCaseId(null);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Case Management</h2>
        {user && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            + New Case
          </button>
        )}
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 rounded-xl bg-white p-4 shadow-sm md:grid-cols-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by case ID or title..."
          className="w-full rounded border border-slate-300 p-2"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded border border-slate-300 p-2"
        >
          <option value="">All Status</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="CLOSED">CLOSED</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
          className="rounded border border-slate-300 p-2"
        >
          <option value="">All Priority</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        {loading ? (
          <div className="p-4 text-sm text-slate-500">Loading cases...</div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-3 font-semibold">Case</th>
                <th className="px-3 py-3 font-semibold">Title</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Priority</th>
                <th className="px-3 py-3 font-semibold">Officer</th>
                <th className="px-3 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCases.map((item) => (
                <tr key={item.caseId} className="border-t border-slate-100">
                  <td className="px-3 py-3 font-medium">{item.caseNumber}</td>
                  <td className="px-3 py-3">{item.title || "-"}</td>
                  <td className="px-3 py-3">{item.status || "-"}</td>
                  <td className="px-3 py-3">{item.priority || "-"}</td>
                  <td className="px-3 py-3">
                    <select
                      value={item.assignedOfficerId || ""}
                      onChange={(event) => assignOfficerFromUi(item.caseId, event.target.value)}
                      disabled={assigningCaseId === item.caseId}
                      className="rounded border border-slate-300 p-1"
                    >
                      <option value="" disabled>
                        Select Officer
                      </option>
                      {officerOptions.map((officer) => (
                        <option key={officer.officerId} value={officer.officerId}>
                          {officer.name} ({officer.officerId})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openCaseDetails(item.caseId)}
                        className="rounded bg-slate-900 px-3 py-1 text-xs font-medium text-white"
                      >
                        View
                      </button>
                      {canUpdateCase(user?.role) && (
                        <button
                          onClick={() => closeCaseFromUi(item)}
                          disabled={item.status === "CLOSED" || updatingStatusCaseId === item.caseId}
                          className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-green-300"
                        >
                          {updatingStatusCaseId === item.caseId ? "Updating..." : "Update"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedCaseId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-xl font-semibold">Case Details</h3>
              <button onClick={closeDetailsModal} className="rounded bg-slate-100 px-3 py-1 text-sm">
                Close
              </button>
            </div>

            {detailsLoading ? (
              <p className="text-sm text-slate-500">Loading case details...</p>
            ) : detailsError ? (
              <p className="text-sm text-red-600">{detailsError}</p>
            ) : selectedCaseDetails ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-3 md:grid-cols-2">
                  <p><span className="font-semibold">Case ID:</span> {selectedCaseDetails.caseId}</p>
                  <p><span className="font-semibold">Case Number:</span> {selectedCaseDetails.caseNumber}</p>
                  <p><span className="font-semibold">Title:</span> {selectedCaseDetails.title || "-"}</p>
                  <p><span className="font-semibold">Crime ID:</span> {selectedCaseDetails.crimeId || "-"}</p>
                  <p><span className="font-semibold">Status:</span> {selectedCaseDetails.status || "-"}</p>
                  <p><span className="font-semibold">Priority:</span> {selectedCaseDetails.priority || "-"}</p>
                  <p><span className="font-semibold">Assigned Officer:</span> {selectedCaseDetails.assignedOfficerId || "-"}</p>
                  <p><span className="font-semibold">Station:</span> {selectedCaseDetails.stationId || "-"}</p>
                  <p><span className="font-semibold">Created:</span> {selectedCaseDetails.createdAt ? new Date(selectedCaseDetails.createdAt).toLocaleString() : "-"}</p>
                  <p><span className="font-semibold">Updated:</span> {selectedCaseDetails.updatedAt ? new Date(selectedCaseDetails.updatedAt).toLocaleString() : "-"}</p>
                </div>

                <CaseTimeline caseId={selectedCaseDetails.caseId} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">No case details found.</p>
            )}
          </div>
        </div>
      ) : null}
    </Layout>
  );
}

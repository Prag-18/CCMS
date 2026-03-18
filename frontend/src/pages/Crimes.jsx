import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import CrimeForm from "../components/CrimeForm";
import { handleUnauthorized } from "../utils/authError";
import { useAuth } from "../context/AuthContext";
import { canCreateCrime } from "../utils/permissions";

function extractItems(payload) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

function Crimes() {
  const { user } = useAuth();
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCrimes();
  }, []);

  const fetchCrimes = async () => {
    try {
      setError("");
      const res = await api.get("/crimes");
      setCrimes(extractItems(res?.data?.data));
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }

      setError(err?.response?.data?.message || "Failed to fetch crimes.");
      setCrimes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Crimes</h2>

        {canCreateCrime(user?.role) ? (
          <CrimeForm onCrimeAdded={fetchCrimes} />
        ) : (
          <p className="text-red-500">
            You are not allowed to register crimes
          </p>
        )}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-slate-900">Recent Crimes</h3>

          {loading ? (
            <p className="text-sm text-slate-500">Loading crimes...</p>
          ) : crimes.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Type</th>
                    <th className="px-3 py-2 font-semibold">Description</th>
                    <th className="px-3 py-2 font-semibold">Location</th>
                    <th className="px-3 py-2 font-semibold">Reported</th>
                  </tr>
                </thead>
                <tbody>
                  {crimes.map((crime) => (
                    <tr key={crime.crime_id} className="border-t border-slate-100">
                      <td className="px-3 py-2">{crime.crime_type || "-"}</td>
                      <td className="px-3 py-2">{crime.description || "-"}</td>
                      <td className="px-3 py-2">{crime.location_id || "-"}</td>
                      <td className="px-3 py-2">
                        {crime.date_reported
                          ? new Date(crime.date_reported).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No crimes found.</p>
          )}
        </section>
      </div>
    </Layout>
  );
}

export default Crimes;

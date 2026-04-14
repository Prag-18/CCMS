const { db } = require("../../core/config/db");

async function getCrimeTrends(filters) {
  const params = [];
  const clauses = [];

  if (filters.fromDate) {
    clauses.push("c.reported_at >= ?");
    params.push(filters.fromDate);
  }

  if (filters.toDate) {
    clauses.push("c.reported_at <= ?");
    params.push(filters.toDate);
  }

  if (filters.stationId) {
    clauses.push("c.station_id = ?");
    params.push(Number(filters.stationId));
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  const sql = `
    SELECT
      DATE_FORMAT(c.reported_at, '%Y-%m') AS period,
      COUNT(*) AS totalCrimes
    FROM Crime c
    ${whereClause}
    GROUP BY DATE_FORMAT(c.reported_at, '%Y-%m')
    ORDER BY period ASC
  `;

  const [rows] = await db.query(sql, params);
  return rows;
}

async function getCrimeTypeDistribution(filters) {
  const params = [];
  const clauses = [];

  if (filters.fromDate) {
    clauses.push("c.reported_at >= ?");
    params.push(filters.fromDate);
  }

  if (filters.toDate) {
    clauses.push("c.reported_at <= ?");
    params.push(filters.toDate);
  }

  if (filters.stationId) {
    clauses.push("c.station_id = ?");
    params.push(Number(filters.stationId));
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const sql = `
    SELECT
      c.crime_type AS crimeType,
      COUNT(*) AS total
    FROM Crime c
    ${whereClause}
    GROUP BY c.crime_type
    ORDER BY total DESC
  `;

  const [rows] = await db.query(sql, params);
  return rows;
}

async function getHotspots(filters) {
  const params = [];
  const clauses = [];

  if (filters.fromDate) {
    clauses.push("c.reported_at >= ?");
    params.push(filters.fromDate);
  }

  if (filters.toDate) {
    clauses.push("c.reported_at <= ?");
    params.push(filters.toDate);
  }

  if (filters.stationId) {
    clauses.push("c.station_id = ?");
    params.push(Number(filters.stationId));
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const limit = Number(filters.limit) || 10;
  const minCount = Number(filters.minCount) || 1;

  const sql = `
    SELECT
      l.location_id AS locationId,
      l.address_line AS addressLine,
      l.city,
      l.state,
      l.latitude,
      l.longitude,
      COUNT(c.crime_id) AS crimeCount
    FROM Crime c
    JOIN Location l ON l.location_id = c.location_id
    ${whereClause}
    GROUP BY l.location_id, l.address_line, l.city, l.state, l.latitude, l.longitude
    HAVING COUNT(c.crime_id) >= ?
    ORDER BY crimeCount DESC
    LIMIT ?
  `;

  const [rows] = await db.query(sql, [...params, minCount, limit]);
  return rows;
}

module.exports = {
  getCrimeTrends,
  getCrimeTypeDistribution,
  getHotspots,
};

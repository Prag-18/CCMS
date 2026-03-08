const analyticsRepository = require("./repository");

async function getCrimeTrends(filters) {
  const items = await analyticsRepository.getCrimeTrends(filters);
  return { items };
}

async function getCrimeTypeDistribution(filters) {
  const items = await analyticsRepository.getCrimeTypeDistribution(filters);
  const total = items.reduce((sum, row) => sum + Number(row.total), 0);

  const distribution = items.map((row) => ({
    ...row,
    percentage: total > 0 ? Number(((row.total / total) * 100).toFixed(2)) : 0,
  }));

  return { items: distribution, total };
}

async function getHotspots(filters) {
  const items = await analyticsRepository.getHotspots(filters);
  return { items };
}

module.exports = {
  getCrimeTrends,
  getCrimeTypeDistribution,
  getHotspots,
};

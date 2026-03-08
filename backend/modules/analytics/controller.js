const analyticsService = require("./service");
const { success } = require("../../core/utils/response");

async function getCrimeTrends(req, res, next) {
  try {
    const data = await analyticsService.getCrimeTrends(req.query);
    return success(res, {
      message: "Crime trends fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function getCrimeTypes(req, res, next) {
  try {
    const data = await analyticsService.getCrimeTypeDistribution(req.query);
    return success(res, {
      message: "Crime type distribution fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function getHotspots(req, res, next) {
  try {
    const data = await analyticsService.getHotspots(req.query);
    return success(res, {
      message: "Crime hotspots fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCrimeTrends,
  getCrimeTypes,
  getHotspots,
};

const caseService = require("./service");
const { success } = require("../../core/utils/response");

async function createCase(req, res, next) {
  try {
    const data = await caseService.createCase(req.body, req.user || {});
    return success(res, {
      statusCode: 201,
      message: "Case created successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function getCases(req, res, next) {
  try {
    const data = await caseService.getCases(req.query);
    return success(res, {
      message: "Cases fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function getCaseById(req, res, next) {
  try {
    const data = await caseService.getCaseById(req.params.id);
    return success(res, {
      message: "Case fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function getCaseTimeline(req, res, next) {
  try {
    const data = await caseService.getTimeline(req.params.id);
    return success(res, {
      message: "Case timeline fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function getRecentTimeline(req, res, next) {
  try {
    const data = await caseService.getRecentTimeline(req.query.limit);
    return success(res, {
      message: "Recent case activity fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateCase(req, res, next) {
  try {
    const data = await caseService.updateCase(req.params.id, req.body, req.user || {});
    return success(res, {
      message: "Case updated successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createCase,
  getCases,
  getCaseById,
  getCaseTimeline,
  getRecentTimeline,
  updateCase,
};

const evidenceService = require("./service");
const { success } = require("../../core/utils/response");

async function uploadEvidence(req, res, next) {
  try {
    const data = await evidenceService.uploadEvidence(req.body, req.file, req.user || {});
    return success(res, {
      statusCode: 201,
      message: "Evidence uploaded successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function getCaseEvidence(req, res, next) {
  try {
    const data = await evidenceService.getCaseEvidence(req.params.id);
    return success(res, {
      message: "Case evidence fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function getEvidence(_req, res, next) {
  try {
    const data = await evidenceService.getEvidence();
    return success(res, {
      message: "Evidence fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  uploadEvidence,
  getCaseEvidence,
  getEvidence,
};

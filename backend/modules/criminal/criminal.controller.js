const criminalService = require("./criminal.service");
const { success } = require("../../core/utils/response");

async function createCriminal(req, res, next) {
  try {
    const data = await criminalService.createCriminal(req.body);
    return success(res, {
      statusCode: 201,
      message: "Criminal profile created",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function getCriminals(req, res, next) {
  try {
    const includeHistory = String(req.query.includeHistory || "false").toLowerCase() === "true";
    const data = await criminalService.getCriminals(includeHistory);
    return success(res, {
      message: "Criminals fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createCriminal,
  getCriminals,
};

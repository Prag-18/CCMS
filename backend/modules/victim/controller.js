const victimService = require("./service");
const { success } = require("../../core/utils/response");

async function createVictim(req, res, next) {
  try {
    const data = await victimService.createVictim(req.body);
    return success(res, {
      statusCode: 201,
      message: "Victim registered successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function getVictims(req, res, next) {
  try {
    const data = await victimService.getVictims();
    return success(res, {
      message: "Victims fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createVictim,
  getVictims,
};

const authService = require("../auth/service");
const { success } = require("../../core/utils/response");

async function getUsers(_req, res, next) {
  try {
    const items = await authService.fetchOfficers();
    return success(res, {
      message: "Users fetched successfully",
      data: { items },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
};

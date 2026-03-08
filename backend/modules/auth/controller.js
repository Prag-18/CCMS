const authService = require("./service");
const { success } = require("../../core/utils/response");

async function login(req, res, next) {
  try {
    const data = await authService.login(req.body);
    return success(res, {
      statusCode: 200,
      message: "Login successful",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};

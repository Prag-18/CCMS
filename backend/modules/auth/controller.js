const service = require("./service");

async function register(req, res, next) {
  try {

    const body = req.body || {};

    const result = await service.registerOfficer({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role
    });

    return res.status(201).json({
      success: true,
      data: result
    });

  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {

    const body = req.body || {};
    const email = body.email;
    const password = body.password;

    const result = await service.loginOfficer({
      email,
      password
    });

    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    return next(error);
  }
}

async function getOfficers(_req, res, next) {
  try {
    const officers = await service.fetchOfficers();
    return res.status(200).json({
      success: true,
      data: {
        items: officers,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  getOfficers,
};

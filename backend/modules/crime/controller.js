const crimeService = require("./service");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createCrime(req, res, next) {
  try {
    const { crime_type, description, location_id, reported_by } = req.body;

    if (crime_type === undefined || description === undefined || location_id === undefined || reported_by === undefined) {
      return next(
        createError("crime_type, description, location_id and reported_by are required", 400)
      );
    }

    const crime = await crimeService.registerCrime({
      crime_type,
      description,
      location_id,
      reported_by,
    });

    return res.status(201).json({
      success: true,
      message: "Crime registered successfully",
      data: crime,
    });
  } catch (error) {
    return next(error);
  }
}

async function getCrimes(_req, res, next) {
  try {
    const crimes = await crimeService.fetchAllCrimes();
    return res.status(200).json({
      success: true,
      message: "Crimes fetched successfully",
      data: crimes,
    });
  } catch (error) {
    return next(error);
  }
}

async function getCrime(req, res, next) {
  try {
    const crime = await crimeService.fetchCrimeById(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Crime fetched successfully",
      data: crime,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateCrime(req, res, next) {
  try {
    const updatedCrime = await crimeService.modifyCrime(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Crime updated successfully",
      data: updatedCrime,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createCrime,
  getCrimes,
  getCrime,
  updateCrime,
};

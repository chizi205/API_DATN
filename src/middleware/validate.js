const { validationResult } = require("express-validator");
const ApiResponse = require("../utils/response");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return ApiResponse.error(res, firstError.msg, 400);
  }

  next();
};

module.exports = validate;

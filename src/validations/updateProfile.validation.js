const { body } = require("express-validator");

const completeRegistrationValidation = [
  body("full_name")
    .notEmpty()
    .withMessage("Vui lòng nhập họ tên")
    .isLength({ min: 2, max: 100 })
    .withMessage("Họ tên phải từ 2 đến 100 ký tự")
    .trim()
    .matches(/^[\p{L}\s'.-]+$/u)
    .withMessage(
      "Họ tên chỉ được chứa chữ cái, dấu cách và một số ký tự hợp lệ",
    ),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail()
    .isLength({ max: 150 })
    .withMessage("Email quá dài"),
  body("date_of_birth").optional(),
];

module.exports = completeRegistrationValidation;

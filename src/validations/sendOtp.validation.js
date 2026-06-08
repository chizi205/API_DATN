const { body } = require("express-validator");

const sendOtpValidation = [
  body("phone")
    .notEmpty()
    .withMessage("Vui lòng nhập số điện thoại")
    .trim()
    .matches(/^(0|\+?84)(3|5|7|8|9)[0-9]{8}$/)
    .withMessage("Số điện thoại không hợp lệ"),
];

module.exports = sendOtpValidation;

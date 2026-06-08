const { body } = require("express-validator");

const verifyOtpValidation = [
  body("phone")
    .notEmpty()
    .withMessage("Vui lòng nhập số điện thoại")
    .trim()
    .matches(/^(0|\+?84)(3|5|7|8|9)[0-9]{8}$/)
    .withMessage("Số điện thoại không hợp lệ"),

  body("code")
    .notEmpty()
    .withMessage("Vui lòng nhập mã OTP")
    .isString()
    .withMessage("Mã OTP phải là chuỗi")
    .trim()
    .isLength({ min: 4, max: 6 })
    .withMessage("Mã OTP phải từ 4 đến 6 ký tự")
    .matches(/^[0-9]+$/)
    .withMessage("Mã OTP chỉ được chứa chữ số"),
];

module.exports = verifyOtpValidation;

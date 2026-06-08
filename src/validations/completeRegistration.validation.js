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
  body("date_of_birth")
    .optional()
    .custom((value) => {
      const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
      if (!regex.test(value)) {
        throw new Error("Ngày sinh không hợp lệ. Định dạng đúng: DD/MM/YYYY");
      }

      const [day, month, year] = value.split("/").map(Number);
      const date = new Date(year, month - 1, day);

      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        throw new Error("Ngày sinh không hợp lệ");
      }

      if (date > new Date()) {
        throw new Error("Ngày sinh không được lớn hơn ngày hiện tại");
      }

      return true;
    }),
];

module.exports = completeRegistrationValidation;

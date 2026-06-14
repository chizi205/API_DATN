const { body } = require("express-validator");

const createDraftInvoiceValidation = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Phải có ít nhất 1 món ăn trong hóa đơn"),

  body("items.*.product_name")
    .notEmpty()
    .withMessage("Tên món ăn không được để trống")
    .isLength({ min: 2, max: 255 })
    .withMessage("Tên món ăn phải từ 2 đến 255 ký tự")
    .trim(),

  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Số lượng phải là số nguyên và lớn hơn 0"),

  body("items.*.unit_price")
    .isFloat({ min: 0 })
    .withMessage("Đơn giá phải là số và không được âm"),

  body("items.*.product_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("product_id phải là số nguyên dương"),


  body("table_number")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Số bàn không được vượt quá 20 ký tự"),

  body("tax_amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Thuế phải là số và không được âm"),

  body("service_charge")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Phí dịch vụ phải là số và không được âm"),

  body("points_multiplier")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Hệ số tích điểm phải là số và không được âm"),
];

module.exports = {
  createDraftInvoiceValidation,
};

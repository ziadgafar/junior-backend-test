import { body, validationResult } from "express-validator";

export const validateCreateProduct = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Product name must be between 3 and 100 characters long"),

  body("category")
    .trim()
    .optional()
    .isString()
    .withMessage("Category must be a string")
    .isLength({ max: 50 })
    .withMessage("Category must be less than 50 characters long"),

  body("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Product price cannot be negative"),

  body("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isInt({ min: 0 })
    .withMessage("Product quantity must be a positive integer"),
];

export const validateUpdateProduct = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Product name must be between 3 and 100 characters long"),

  body("category")
    .optional()
    .trim()
    .isString()
    .withMessage("Category must be a string")
    .isLength({ max: 50 })
    .withMessage("Category must be less than 50 characters long"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Product price cannot be negative"),

  body("quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Product quantity must be a positive integer"),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

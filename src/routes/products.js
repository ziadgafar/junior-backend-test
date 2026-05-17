import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import {
  validateCreateProduct,
  validateUpdateProduct,
  handleValidationErrors,
} from "../validators/productValidator.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post(
  "/",
  auth,
  authorize("admin"),
  validateCreateProduct,
  handleValidationErrors,
  createProduct,
);
router.put(
  "/:id",
  auth,
  authorize("admin"),
  validateUpdateProduct,
  handleValidationErrors,
  updateProduct,
);
router.delete("/:id", auth, authorize("admin"), deleteProduct);

export default router;

import Product from "../models/product.js";

export const createProduct = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;
    const product = await Product.create({ name, category, price, quantity });
    res
      .status(201)
      .json({
        success: true,
        message: "Product created successfully.",
        product,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error creating product.",
        error: error.message,
      });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find().skip(skip).limit(limit).lean(),
      Product.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          productsPerPage: limit,
        },
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error retrieving products.",
        error: error.message,
      });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Product retrieved successfully.",
        product,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error retrieving product.",
        error: error.message,
      });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Product updated successfully.",
        product,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating product.",
        error: error.message,
      });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Product deleted successfully.",
        product,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting product.",
        error: error.message,
      });
  }
};

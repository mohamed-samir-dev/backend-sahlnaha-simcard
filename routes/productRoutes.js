const express = require("express");
const router = express.Router();
const { getProducts, getProductById, getFeaturedProducts, createProduct, updateProduct, deleteProduct } = require("../controllers/productController");

router.route("/").get(getProducts).post(createProduct);
router.get("/featured", getFeaturedProducts);
router.route("/:id").get(getProductById).put(updateProduct).delete(deleteProduct);

module.exports = router;

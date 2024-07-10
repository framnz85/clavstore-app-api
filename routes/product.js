const express = require("express");
const router = express.Router();
const { getProducts, updateProduct } = require("../controllers/product");
const { authCheck, adminGratisCheck } = require("../middlewares/auth");

router.get("/app/all-products", authCheck, adminGratisCheck, getProducts);
router.put("/app/update-product", authCheck, adminGratisCheck, updateProduct);

module.exports = router;

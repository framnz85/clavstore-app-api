const express = require("express");
const router = express.Router();
const { getCategories } = require("../controllers/category");
const { authCheck, adminGratisCheck } = require("../middlewares/auth");

router.get("/app/all-categories", authCheck, adminGratisCheck, getCategories);

module.exports = router;

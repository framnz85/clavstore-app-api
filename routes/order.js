const express = require("express");
const router = express.Router();
const { getPosOrders, saveOrder, sendOrder } = require("../controllers/order");
const { authCheck, adminGratisCheck } = require("../middlewares/auth");

router.get("/app/all-pos-orders", authCheck, adminGratisCheck, getPosOrders);
router.post("/app/save-pos-orders", authCheck, adminGratisCheck, saveOrder);
router.post("/app/send-pos-orders", authCheck, adminGratisCheck, sendOrder);

module.exports = router;

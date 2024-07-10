const express = require("express");
const router = express.Router();
const { getUsers, getUserDetails, loginUser } = require("../controllers/user");
const { authCheck, adminGratisCheck } = require("../middlewares/auth");

router.get("/app/all-users", authCheck, adminGratisCheck, getUsers);
router.get("/app/user-details/:resellid", authCheck, getUserDetails);

router.post("/app/auth-login", loginUser);

module.exports = router;

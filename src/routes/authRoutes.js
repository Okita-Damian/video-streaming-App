const express = require("express");
const router = express.Router();
const controller = require("../controllers/authController");

router.post("/signup", controller.register);
router.post("/login", controller.login);
router.post("/refresh-token", controller.refreshToken);
router.post("/logout", controller.logout);

module.exports = router;

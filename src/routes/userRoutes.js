const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/auths");

router.get("/", protect, restrictTo("admin"), userController.getAllUsers);

router.get("/:id", protect, userController.getUserById);

router.patch("/:id", protect, userController.updateUser);

router.delete("/:id", protect, restrictTo("admin"), userController.deleteUser);

router.delete("/me", protect, userController.deleteMyAccount);

module.exports = router;

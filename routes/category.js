const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
} = require("../controller/category");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createCategory);

router.get("/:id", getCategory);
router.get("/", getAllCategories);

router.put("/:id", authMiddleware, isAdmin, updateCategory);

router.delete("/:id", authMiddleware, isAdmin, deleteCategory);

module.exports = router;
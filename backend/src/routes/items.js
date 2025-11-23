const express = require("express");
const router = express.Router();

const itemsController = require("../controllers/itemsController");

// listagem pública
router.get("/", itemsController.getAll);
router.get("/:id", itemsController.getById);

module.exports = router;

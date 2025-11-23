const express = require("express");
const router = express.Router();

const transactionsController = require("../controllers/transactionsController");
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");

// usuário vê suas próprias transações
router.get("/mine", auth, transactionsController.listMine);

// admin vê todas as transações
router.get("/", auth, isAdmin, transactionsController.listAll);

// admin vê detalhes de uma transação específica
router.get("/:id", auth, isAdmin, transactionsController.getById);

module.exports = router;

const express = require("express");
const router = express.Router();

const submissionsController = require("../controllers/submissionsController");
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");

// Usuário cria submissão
router.post("/", auth, submissionsController.create);

// Usuário vê suas submissões
router.get("/mine", auth, submissionsController.listMine);

// Admin vê TODAS
router.get("/", auth, isAdmin, submissionsController.listAll);

// Pega Pelo Id
router.get("/:id", auth, isAdmin, submissionsController.getById);

// Admin aprova
router.patch("/:id/approve", auth, isAdmin, submissionsController.approve);

// Admin rejeita
router.patch("/:id/reject", auth, isAdmin, submissionsController.reject);

// Usuário cancela a sua própria
router.delete("/:id", auth, submissionsController.cancel);

module.exports = router;

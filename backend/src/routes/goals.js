const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const goalsController = require("../controllers/goalsController");

// Criar meta (APENAS ADMIN)
router.post("/", auth, isAdmin, goalsController.create);

// Listar todas metas (USUÁRIO E ADMIN)
router.get("/", auth, goalsController.getAll);

// Buscar meta por ID
router.get("/:id", auth, goalsController.getById);

// Atualizar meta (ADMIN)
router.put("/:id", auth, isAdmin, goalsController.update);

// Remover meta (ADMIN)
router.delete("/:id", auth, isAdmin, goalsController.delete);

module.exports = router;

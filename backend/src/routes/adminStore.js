// routes/adminStore.js
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");

const itemsController = require("../controllers/itemsController");
const rewardsController = require("../controllers/rewardsController");

// ---- ITENS (ADMIN) ----

// Listar o item
router.get("/items", auth, isAdmin, itemsController.getAll);

// Criar item
router.post("/items", auth, isAdmin, itemsController.create);

// Atualizar item
router.put("/items/:id", auth, isAdmin, itemsController.update);

// Deletar item
router.delete("/items/:id", auth, isAdmin, itemsController.delete);

// ---- RECOMPENSAS (ADMIN) ----

// Listar TODAS recompensas de TODOS usuários
router.get("/rewards", auth, isAdmin, rewardsController.listAll);

// Marcar recompensa como PRONTA
router.patch("/rewards/:id/ready", auth, isAdmin, rewardsController.markReady);

// Marcar recompensa como ENTREGUE
router.patch("/rewards/:id/received", auth, isAdmin, rewardsController.markReceived);

module.exports = router;

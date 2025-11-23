// routes/rewards.js
const express = require("express");
const router = express.Router();

const rewardsController = require("../controllers/rewardsController");
const auth = require("../middlewares/auth");

// usuário vê suas recompensas
router.get("/mine", auth, rewardsController.listMine);

module.exports = router;

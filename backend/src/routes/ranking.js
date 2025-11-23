// src/routes/ranking.js
const express = require('express');
const router = express.Router();
const rankingCtrl = require('../controllers/rankingController');
const auth = require('../middlewares/auth');

router.get('/top/xp', auth, rankingCtrl.topByXp);

module.exports = router;

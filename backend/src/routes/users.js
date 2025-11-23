// src/routes/users.js
const express = require('express');
const router = express.Router();
const usersCtrl = require('../controllers/usersController');
const auth = require('../middlewares/auth');

// List users (admin)
router.get('/', auth, usersCtrl.list);

// Get user by id (auth required)
router.get('/:id', auth, usersCtrl.getById);

// Get goals assigned to a user (calls .NET) - optional, requires NET_API_URL
router.get('/:id/goals', auth, usersCtrl.getGoalsForUser);

module.exports = router;

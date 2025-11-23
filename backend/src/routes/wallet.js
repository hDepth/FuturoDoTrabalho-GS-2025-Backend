// src/routes/wallet.js
const express = require('express');
const router = express.Router();
const walletCtrl = require('../controllers/walletController');
const auth = require('../middlewares/auth');

// current user's wallet
router.get('/', auth, walletCtrl.getMyWallet);

// admin: get wallet by user id
router.get('/:userId', auth, walletCtrl.getWalletByUserId);

// admin: adjust wallet
router.post('/:userId/adjust', auth, walletCtrl.adjustWallet);

module.exports = router;

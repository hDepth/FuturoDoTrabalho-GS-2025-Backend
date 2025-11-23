const express = require('express');
const router = express.Router();
const redeem = require('../controllers/redeemController');
const auth = require('../middlewares/auth');
router.post('/:id/redeem', auth, redeem.redeem);
module.exports = router;

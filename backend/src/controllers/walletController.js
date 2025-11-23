// src/controllers/walletController.js
const walletsModel = require('../models/wallets');
const usersModel = require('../models/users');

exports.getMyWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const wallet = await walletsModel.getWalletByUser(userId);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    return res.json(wallet);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching wallet' });
  }
};

// Admin: get any wallet by user id
exports.getWalletByUserId = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const wallet = await walletsModel.getWalletByUser(userId);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    return res.json(wallet);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching wallet' });
  }
};

// Admin: adjust wallet fields (xp/coins/gems) - body: { xp: 10, coins: -5, gems: 0 }
exports.adjustWallet = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const fields = req.body || {};
    // Validate fields keys
    const allowed = ['xp','coins','gems','level'];
    const invalid = Object.keys(fields).filter(k => !allowed.includes(k));
    if (invalid.length) return res.status(400).json({ message: 'Invalid fields: ' + invalid.join(',') });

    await walletsModel.updateWalletByUser(userId, fields);
    const updated = await walletsModel.getWalletByUser(userId);
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error adjusting wallet' });
  }
};

const axios = require('axios');
const walletsModel = require('../models/wallets');
const redeemModel = require('../models/redeem');
require('dotenv').config();
exports.redeem = async (req, res) => {
  const userId = req.user.id;
  const storeItemId = req.params.id;
  const NET_API = process.env.NET_API_URL;
  try {
    const itemRes = await axios.get(`${NET_API}/api/storeitem/${storeItemId}`);
    const item = itemRes.data;
    if (!item) return res.status(404).json({ message: 'Item not found' });
    const wallet = await walletsModel.getWalletByUser(userId);
    const priceCoins = item.priceCoins || item.price || 0;
    if ((wallet.COINS || wallet.coins || 0) < priceCoins) return res.status(400).json({ message: 'Not enough coins' });
    await walletsModel.updateWalletByUser(userId, { coins: (wallet.COINS || wallet.coins || 0) - priceCoins });
    const redemption = await redeemModel.createRedemption({ userId, storeItemId, priceCoins, priceGems: item.priceGems || 0 });
    res.json({ message: 'Redeemed', redemption });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error' });
  }
};

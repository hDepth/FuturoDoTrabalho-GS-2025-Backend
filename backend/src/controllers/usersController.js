// src/controllers/usersController.js
const usersModel = require('../models/users');
const walletsModel = require('../models/wallets');
const axios = require('axios');
require('dotenv').config();

exports.list = async (req, res) => {
  try {
    // Very simple list (for production add pagination)
    // Query all users: we'll use a direct SQL in model; adjust if needed
    const conn = await require('../db').getConnection();
    const result = await conn.execute('SELECT id, name, email, role FROM users ORDER BY id', {}, { outFormat: require('../db').oracledb.OUT_FORMAT_OBJECT });
    await conn.close();
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error listing users' });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await usersModel.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // attach wallet
    const wallet = await walletsModel.getWalletByUser(id);
    return res.json({ user, wallet });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching user' });
  }
};

// Optional: fetch goals for user from .NET Goals API (if available)
exports.getGoalsForUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    // If .NET API has endpoint to get user's goals, adapt URL
    const NET_API = process.env.NET_API_URL;
    if (!NET_API) return res.status(400).json({ message: 'NET_API_URL not configured' });

    // Example: /api/goals?assignedTo={userId} -- adapt as your .NET supports
    const resp = await axios.get(`${NET_API}/api/goal?userId=${userId}`);
    return res.json(resp.data);
  } catch (err) {
    console.error(err?.response?.data || err.message || err);
    return res.status(500).json({ message: 'Error fetching goals from .NET API' });
  }
};

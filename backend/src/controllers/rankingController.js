// src/controllers/rankingController.js
// RANKING: top users by xp (wallets.xp)
const db = require('../db');

exports.topByXp = async (req, res) => {
  try {
    const conn = await db.getConnection();
    const sql = `
      SELECT u.id, u.name, w.xp, w.coins, w.gems
      FROM users u
      JOIN wallets w ON w.user_id = u.id
      ORDER BY w.xp DESC NULLS LAST
      FETCH FIRST 50 ROWS ONLY
    `;
    const result = await conn.execute(sql, {}, { outFormat: db.oracledb.OUT_FORMAT_OBJECT });
    await conn.close();
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error generating ranking' });
  }
};
